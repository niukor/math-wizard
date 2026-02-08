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
import org.springframework.util.PropertyPlaceholderHelper;

import java.lang.annotation.*;
import java.lang.reflect.Constructor;
import java.lang.reflect.Field;
import java.lang.reflect.Parameter;
import java.util.HashSet;
import java.util.Set;

@Component
public class MultiCountryConfigIntegrityGuard implements MergedBeanDefinitionPostProcessor, org.springframework.context.EnvironmentAware {

    private static final Logger log = LoggerFactory.getLogger(MultiCountryConfigIntegrityGuard.class);
    private static final PropertyPlaceholderHelper PLACEHOLDER_HELPER = new PropertyPlaceholderHelper("${", "}", ":", true);

    @Value("${multi.country.config.scan.packages:com.yourcompany}")
    private String[] scanPackages;

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

        // 3. 检查@Value注解（原有逻辑）
        checkValueAnnotations(beanType, beanName);

        // 4. 新增：检查@ConfigurationProperties注解
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
     * 核心新增：检查@ConfigurationProperties注解的类
     */
    private void checkConfigurationProperties(Class<?> beanType, String beanName) {
        ConfigurationProperties cpAnnotation = AnnotationUtils.findAnnotation(beanType, ConfigurationProperties.class);
        if (cpAnnotation == null) {
            return;
        }

        // 获取配置前缀
        String prefix = cpAnnotation.prefix().trim();
        if (StringUtils.isEmpty(prefix)) {
            log.warn("Bean {} (@ConfigurationProperties) 未配置prefix，跳过检查", beanName);
            return;
        }

        log.debug("检查@ConfigurationProperties类，前缀: {}，类: {}", prefix, beanType.getName());

        // 递归扫描所有字段（包括父类）
        Set<Class<?>> processedClasses = new HashSet<>();
        scanConfigurationPropertiesFields(beanType, prefix, processedClasses, beanType, beanName);
    }

    /**
     * 递归扫描@ConfigurationProperties类的所有字段，检查配置完整性
     */
    private void scanConfigurationPropertiesFields(Class<?> currentClass, String currentPrefix,
                                                  Set<Class<?>> processedClasses, Class<?> originalClass, String beanName) {
        // 避免循环继承导致的死循环
        if (currentClass == null || processedClasses.contains(currentClass) || currentClass == Object.class) {
            return;
        }
        processedClasses.add(currentClass);

        // 扫描当前类的字段
        ReflectionUtils.doWithFields(currentClass, field -> {
            // 跳过静态字段、跳过注解标记的字段
            if (java.lang.reflect.Modifier.isStatic(field.getModifiers()) ||
                    AnnotationUtils.findAnnotation(field, SkipMultiCountryCheck.class) != null) {
                return;
            }

            // 字段名转配置名（驼峰转连字符，如 userName → user-name）
            String fieldConfigName = camelToHyphen(field.getName());
            String fullConfigKey = currentPrefix + "." + fieldConfigName;

            // 检查1：字段是否有默认值（初始化值）
            Object fieldDefaultValue = getFieldDefaultValue(field, originalClass);
            boolean hasFieldDefault = fieldDefaultValue != null;

            // 检查2：是否有@DefaultValue注解（Spring Boot 2.2+）
            DefaultValue defaultValueAnn = AnnotationUtils.getAnnotation(field, DefaultValue.class);
            boolean hasDefaultValueAnn = defaultValueAnn != null && StringUtils.hasText(defaultValueAnn.value());

            // 检查3：环境中是否存在该配置（公共配置文件有兜底）
            boolean hasEnvConfig = environment.containsProperty(fullConfigKey);

            // 检查4：是否是嵌套的@ConfigurationProperties对象（递归处理）
            Class<?> fieldType = field.getType();
            if (AnnotationUtils.findAnnotation(fieldType, ConfigurationProperties.class) != null) {
                scanConfigurationPropertiesFields(fieldType, fullConfigKey, processedClasses, originalClass, beanName);
                return;
            }

            // 核心判断：无默认值 + 无环境配置 → 报错
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
     * 获取字段的默认值（判断是否显式初始化）
     */
    private Object getFieldDefaultValue(Field field, Class<?> clazz) {
        try {
            // 暴力访问私有字段
            field.setAccessible(true);
            // 创建类的实例（无参构造），获取字段默认值
            Object instance = clazz.getDeclaredConstructor().newInstance();
            return field.get(instance);
        } catch (Exception e) {
            // 无参构造不存在/反射异常 → 视为无默认值
            return null;
        }
    }

    /**
     * 驼峰转连字符（适配Spring配置命名规则）
     */
    private String camelToHyphen(String name) {
        if (name == null) return null;
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < name.length(); i++) {
            char c = name.charAt(i);
            if (Character.isUpperCase(c)) {
                if (i > 0) {
                    result.append('-');
                }
                result.append(Character.toLowerCase(c));
            } else {
                result.append(c);
            }
        }
        return result.toString();
    }

    // ------------------- 原有逻辑（略作调整） -------------------
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

    private void validateValueExpression(String expression, String location, Class<?> clazz, String beanName) {
        if (expression == null || expression.isEmpty()) return;
        PLACEHOLDER_HELPER.replacePlaceholders(expression, placeholderName -> {
            if (!placeholderName.contains(":")) {
                String errorMsg = String.format(
                        "\n[多国家合规检查失败]:\n" +
                        "Bean 名称: %s\n" +
                        "位置: 类 [%s] 的 %s\n" +
                        "错误原因: 配置占位符 ${%s} 未设置默认值。\n" +
                        "修复方案: 修改为 ${%s:默认值} 格式（支持嵌套），或在公共配置中补齐。",
                        beanName, clazz.getName(), location, placeholderName, placeholderName
                );
                log.error(errorMsg);
                throw new IllegalStateException(errorMsg);
            }
            return placeholderName;
        });
    }

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

    private boolean isSetterMethod(java.lang.reflect.Method method) {
        return method.getName().startsWith("set")
                && method.getName().length() > 3
                && method.getParameterCount() == 1
                && (method.getReturnType() == void.class || method.getReturnType() == method.getDeclaringClass());
    }

    @Override
    public void setEnvironment(Environment environment) {
        this.environment = environment;
    }

    // ------------------- 注解定义 -------------------
    @Target({ElementType.TYPE, ElementType.FIELD, ElementType.PARAMETER, ElementType.CONSTRUCTOR})
    @Retention(RetentionPolicy.RUNTIME)
    public @interface SkipMultiCountryCheck {
    }
}
