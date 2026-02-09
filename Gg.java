@Override
public void postProcessMergedBeanDefinition(RootBeanDefinition beanDefinition, Class<?> beanType, String beanName) {
    // 1. 优先处理 FeignClientFactoryBean 类型的 Bean
    if (FeignClientFactoryBean.class.isAssignableFrom(beanDefinition.getBeanClass())) {
        // 从 FactoryBean 中获取原始 Feign 接口类型
        Object factoryBean = beanDefinition.getResolvableType().getRawClass();
        if (factoryBean instanceof FeignClientFactoryBean) {
            Class<?> feignInterface = ((FeignClientFactoryBean) factoryBean).getType();
            if (feignInterface != null && feignInterface.isInterface()) {
                beanType = feignInterface;
            }
        }
    }

    // 2. 包名过滤
    if (!shouldScanBean(beanDefinition, beanType)) {
        return;
    }

    // 3. 基础过滤（空类型、代理类、跳过注解）
    if (beanType == null || beanType.isProxyClass() || AnnotationUtils.findAnnotation(beanType, SkipMultiCountryCheck.class) != null) {
        return;
    }

    log.debug("开始检查多国家配置完整性，Bean: {}，类型: {}", beanName, beanType.getName());
    // 4. 检查@Value注解（字段、构造、Setter）
    checkValueAnnotations(beanType, beanName);
    // 5. 检查@ConfigurationProperties注解
    checkConfigurationProperties(beanType, beanName);
    // 6. 检查@FeignClient注解
    checkFeignClientAnnotations(beanType, beanName);
}
