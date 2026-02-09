/**
 * 检查@FeignClient注解中的占位符是否包含默认值
 */
private void checkFeignClientAnnotations(Class<?> beanType, String beanName) {
    FeignClient feignClientAnn = AnnotationUtils.findAnnotation(beanType, FeignClient.class);
    if (feignClientAnn == null) {
        return;
    }

    log.debug("检查@FeignClient配置，Bean: {}，接口: {}", beanName, beanType.getName());

    // 检查url属性
    validateFeignPlaceholder(feignClientAnn.url(), "url", beanType, beanName);
    // 检查path属性
    validateFeignPlaceholder(feignClientAnn.path(), "path", beanType, beanName);
    // 检查name属性（通常是服务名，但也可能用占位符）
    validateFeignPlaceholder(feignClientAnn.name(), "name", beanType, beanName);
    // 检查contextId属性
    validateFeignPlaceholder(feignClientAnn.contextId(), "contextId", beanType, beanName);
}

/**
 * 校验单个@FeignClient属性的占位符
 */
private void validateFeignPlaceholder(String value, String propertyName, Class<?> clazz, String beanName) {
    if (StringUtils.isEmpty(value)) {
        return;
    }

    Matcher matcher = PLACEHOLDER_PATTERN.matcher(value);
    while (matcher.find()) {
        String placeholderContent = matcher.group(1);
        if (!placeholderContent.contains(":")) {
            String errorMsg = String.format(
                    "\n[多国家合规检查失败]:\n" +
                    "Bean 名称: %s\n" +
                    "位置: @FeignClient接口 [%s] 的属性 [%s]\n" +
                    "错误原因: 配置占位符 ${%s} 未设置默认值。\n" +
                    "修复方案: 修改为 ${%s:默认值} 格式，或在公共配置中补齐。",
                    beanName, clazz.getName(), propertyName, placeholderContent, placeholderContent
            );
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }
    }
}
