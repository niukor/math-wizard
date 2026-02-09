import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.support.MergedBeanDefinitionPostProcessor;
import org.springframework.beans.factory.support.RootBeanDefinition;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.core.annotation.AnnotationUtils;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;
import org.springframework.util.ReflectionUtils;
import org.springframework.util.StringUtils;

import java.lang.annotation.*;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Parameter;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class MultiCountryConfigIntegrityGuard implements MergedBeanDefinitionPostProcessor, org.springframework.context.EnvironmentAware {

    private static final Logger log = LoggerFactory.getLogger(MultiCountryConfigIntegrityGuard.class);
    // 正则匹配${xxx}占位符（非贪婪匹配，支持嵌套）
    private static final Pattern PLACEHOLDER_PATTERN = Pattern.compile("\\$\\{([^}]*)\\}");
    // 扫描包配置
    @Value("${multi.country.config.scan.packages:com.yourcompany}")
    private String[] scanPackages;
    // 环境变量注入
    private Environment environment;

    @Override
    public void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName) {
        // 1. 包名过滤
        if (!shouldScanBean(beanDefinition, beanType)) {
            return;
        }
        // 2. 基础过滤（空类型、代理类、跳过注解）
        if (beanType == null || beanType.isProxyClass() || AnnotationUtils.findAnnotation(beanType, SkipMultiCountryCheck.class) != null) {
            return;
        }

        log.debug("开始检查多国家配置完整性，Bean: {}，类型: {}", beanName, beanType.getName());
        // 3. 检查@Value注解（字段、构造、Setter）
        checkValueAnnotations(beanType, beanName);
        // 4. 检查@ConfigurationProperties注解
        checkConfigurationProperties(beanType, beanName);
    }

    /**
     * 检查@Value注解（字段、构造函数、Setter方法）
     */
    private void checkValueAnnotations(Class<?> beanType, String beanName) {
        // 字段
        ReflectionUtils.doWithFields(beanType, field -> {
            if (AnnotationUtils.findAnnotation(field, SkipMultiCountryCheck.class) != null) return;
            Value valueAnn = AnnotationUtils.getAnnotation(field, Value.class);
            if (valueAnn != null) {
                validateValueExpression(valueAnn.value(), "字段 [" + field.getName() + "]", beanType, beanName);
            }
        });
        // 构造函数
        ReflectionUtils.doWithConstructors(beanType, constructor -> {
            checkConstructorParams(constructor, beanType, beanName);
        });
        // Setter方法
        ReflectionUtils.doWithMethods(beanType, method -> {
            if (isSetterMethod(method)) {
                checkMethodParams(method, beanType, beanName);
            }
        });
    }

    /**
     * 核心：检查@ConfigurationProperties注解的类
     */
    private void checkConfigurationProperties(Class<?> beanType, String beanName) {
        ConfigurationProperties cpAnnotation = AnnotationUtils.findAnnotation(beanType, ConfigurationProperties.class);
        if (cpAnnotation == null) {
            return;
        }
        String prefix = cpAnnotation.prefix().trim();
        if (StringUtils.isEmpty(prefix)) {
            log.warn("Bean {} (@ConfigurationProperties) 未配置prefix，跳过检查", beanName);
            return;
        }
        log.debug("检查@ConfigurationProperties类，前缀: {}，类: {}", prefix, beanType.getName());
        // 递归扫描所有字段（含父类，避免循环继承）
        Set<Class<?>> processedClasses = new HashSet<>();
        scanConfigurationPropertiesFields(beanType, prefix, processedClasses, beanType, beanName);
    }

    /**
     * 递归扫描@ConfigurationProperties类的所有字段，检查配置完整性
     */
    private void scanConfigurationPropertiesFields(Class<?> currentClass, String currentPrefix,
                                                  Set<Class<?>> processedClasses, Class<?> originalClass, String beanName) {
        if (currentClass == null || processedClasses.contains(currentClass) || currentClass == Object.class) {
            return;
        }
        processedClasses.add(currentClass);

        // 扫描当前类字段
        ReflectionUtils.doWithFields(currentClass, field -> {
            // 跳过静态字段、跳过注解标记字段
            if (java.lang.reflect.Modifier.isStatic(field.getModifiers()) ||
                    AnnotationUtils.findAnnotation(field, SkipMultiCountryCheck.class) != null) {
                return;
            }
            // 驼峰转连字符（userName → user-name），适配Spring配置命名规则
            String fieldConfigName = camelToHyphen(field.getName());
            String fullConfigKey = currentPrefix + "." + fieldConfigName;
            Class<?> fieldType = field.getType();

            // 嵌套@ConfigurationProperties对象，递归处理
            if (AnnotationUtils.findAnnotation(fieldType, ConfigurationProperties.class) != null) {
                scanConfigurationPropertiesFields(fieldType, fullConfigKey, processedClasses, originalClass, beanName);
                return;
            }

            // 获取字段默认值（显式初始化值）
            Object fieldDefaultValue = getFieldDefaultValue(field, originalClass);
            boolean hasFieldDefault = fieldDefaultValue != null;
            // 检查@DefaultValue注解
            DefaultValue defaultValueAnn = AnnotationUtils.getAnnotation(field, DefaultValue.class);
            boolean hasDefaultValueAnn = defaultValueAnn != null && StringUtils.hasText(defaultValueAnn.value());
            // 检查环境中是否存在该配置
            boolean hasEnvConfig = environment.containsProperty(fullConfigKey);

            // 核心校验：无默认值 + 无环境配置 → 抛异常
            if (!hasFieldDefault && !hasDefaultValueAnn && !hasEnvConfig) {
                String errorMsg = String.format(
                        "\n[多国家合规检查失败]:\n" +
                        "Bean 名称: %s\n" +
                        "位置: @ConfigurationProperties类 [%s] 的字段 [%s]\n" +
                        "错误原因: 配置项 %s 既无字段默认值、也无@DefaultValue注解，且公共配置中未找到该配置。\n" +
                        "修复方案: 1. 给字段设置默认值（如 private String %s = \"默认值\";）；2. 添加@DefaultValue(\"默认值\")；3. 在公共application.properties中配置 %s=默认值。",
                        beanName, originalClass.getName(), field.getName(), fullConfigKey, field.getName(), fullConfigKey
                );
                log.error(errorMsg);
                throw new IllegalStateException(errorMsg);
            }
        });

        // 递归扫描父类字段
        scanConfigurationPropertiesFields(currentClass.getSuperclass(), currentPrefix, processedClasses, originalClass, beanName);
    }

    /**
     * 解析@Value中的占位符，校验是否都有默认值（核心改造：基于Environment+正则）
     */
    private void validateValueExpression(String expression, String location, Class<?> clazz, String beanName) {
        if (expression == null || expression.isEmpty()) return;

        Matcher matcher = PLACEHOLDER_PATTERN.matcher(expression);
        while (matcher.find()) {
            // 获取占位符内的内容（如${key:default} → key:default）
            String placeholderContent = matcher.group(1);
            // 无默认值分隔符 → 校验失败
            if (!placeholderContent.contains(":")) {
                String errorMsg = String.format(
                        "\n[多国家合规检查失败]:\n" +
                        "Bean 名称: %s\n" +
                        "位置: 类 [%s] 的 %s\n" +
                        "错误原因: 配置占位符 ${%s} 未设置默认值。\n" +
                        "修复方案: 修改为 ${%s:默认值} 格式（支持嵌套），或在公共配置中补齐。",
                        beanName, clazz.getName(), location, placeholderContent, placeholderContent
                );
                log.error(errorMsg);
                throw new IllegalStateException(errorMsg);
            }
        }
    }

    /**
     * 获取字段的显式默认值（无参构造实例化）
     */
    private Object getFieldDefaultValue(Field field, Class<?> clazz) {
        try {
            field.setAccessible(true);
            // 无参构造创建实例，获取初始化值
            Object instance = clazz.getDeclaredConstructor().newInstance();
            return field.get(instance);
        } catch (NoSuchMethodException e) {
            log.debug("类 {} 无无参构造，无法获取字段 {} 默认值", clazz.getName(), field.getName());
        } catch (Exception e) {
            log.debug("获取类 {} 字段 {} 默认值失败", clazz.getName(), field.getName(), e);
        }
        return null;
    }

    /**
     * 驼峰命名转连字符命名（userName → user-name）
     */
    private String camelToHyphen(String name) {
        if (name == null || name.isEmpty()) return name;
        StringBuilder result = new StringBuilder();
        result.append(Character.toLowerCase(name.charAt(0)));
        for (int i = 1; i < name.length(); i++) {
            char c = name.charAt(i);
            if (Character.isUpperCase(c)) {
                result.append('-').append(Character.toLowerCase(c));
            } else {
                result.append(c);
            }
        }
        return result.toString();
    }

    /**
     * 判断是否为Setter方法
     */
    private boolean isSetterMethod(java.lang.reflect.Method method) {
        return method.getName().startsWith("set")
                && method.getName().length() > 3
                && method.getParameterCount() == 1
                && (method.getReturnType() == void.class || method.getReturnType() == method.getDeclaringClass());
    }

    /**
     * 检查构造函数参数的@Value注解
     */
    private void checkConstructorParams(Constructor<?> constructor, Class<?> clazz, String beanName) {
        Parameter[] parameters = constructor.getParameters();
        for (Parameter param : parameters) {
            if (AnnotationUtils.findAnnotation(param, SkipMultiCountryCheck.class) != null) continue;
            Value valueAnn = AnnotationUtils.getAnnotation(param, Value.class);
            if (valueAnn != null) {
                validateValueExpression(valueAnn.value(), "构造函数 [" + constructor.getName() + "] 参数 [" + param.getName() + "]", clazz, beanName);
            }
        }
    }

    /**
     * 检查Setter方法参数的@Value注解
     */
    private void checkMethodParams(java.lang.reflect.Method method, Class<?> clazz, String beanName) {
        Parameter[] parameters = method.getParameters();
        for (Parameter param : parameters) {
            if (AnnotationUtils.findAnnotation(param, SkipMultiCountryCheck.class) != null) continue;
            Value valueAnn = AnnotationUtils.getAnnotation(param, Value.class);
            if (valueAnn != null) {
                validateValueExpression(valueAnn.value(), "Setter 方法 [" + method.getName() + "] 参数 [" + param.getName() + "]", clazz, beanName);
            }
        }
    }

    /**
     * 包名过滤，仅扫描指定业务包下的Bean
     */
    private boolean shouldScanBean(RootBeanDefinition beanDefinition, Class<?> beanType) {
        String beanClassName = beanDefinition.getBeanClassName();
        if (StringUtils.isEmpty(beanClassName)) {
            beanClassName = beanType != null ? beanType.getName() : null;
        }
        if (StringUtils.isEmpty(beanClassName) || scanPackages == null || scanPackages.length == 0) {
            return false;
        }
        for (String packagePrefix : scanPackages) {
            if (beanClassName.startsWith(packagePrefix)) {
                return true;
            }
        }
        log.trace("跳过非业务包Bean的配置检查，类名: {}", beanClassName);
        return false;
    }

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    // 跳过检查注解
    @Target({ElementType.TYPE, ElementType.FIELD, ElementType.PARAMETER, ElementType.CONSTRUCTOR, ElementType.METHOD})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface SkipMultiCountryCheck {
    }
}
