// 在 postProcessMergedBeanDefinition 方法最前面添加
if (beanType.isInterface() && AnnotationUtils.findAnnotation(beanType, FeignClient.class) != null) {
    // 直接处理 Feign 接口本身
} else if (AopUtils.isAopProxy(beanType)) {
    // 获取被代理的原始目标类
    Class<?> targetClass = AopUtils.getTargetClass(beanType);
    if (targetClass != null) {
        beanType = targetClass;
    }
}
