/**
 * 从数组中移除一个元素
 * @param elements 数组
 * @param removeElement 移除的元素
 * @param equalsPropName 用于比较的属性
 */
export function removeToArray<T, K extends keyof T, E extends T = T>(elements: Array<T>, removeElement: E, equalsPropName?: K) {

    const index = indexOfToArray(elements, removeElement, equalsPropName);

    if (index > -1) {
        elements.splice(index, 1);
    }
}


/**
 * 确定某个元素在数组中的位置
 * @param elements 数组
 * @param element 数组元素
 * @param equalsPropName 用于比较的属性
 * @return 返回元素在数组中的位置，不存在返回 -1
 */
export function indexOfToArray<T, K extends keyof T, E extends T = T>(elements: Array<T>, element: E, equalsPropName?: K) {
    if (element == null || elements == null || elements.length == 0) {
        return -1;
    }
    // @ts-ignore
    if (!(equalsPropName in element)) {
        return -1;
    }
    return elements.findIndex((value) => {
        if (value == null) {
            return false;
        }

        if (equalsPropName == null) {
            return value == element;
        } else {
            return value[equalsPropName] == element[equalsPropName];
        }
    })
}

/**
 * 数组是否为 empty
 * @param elements 数组元素
 * @return if true array is empty
 */
export const isEmpty = (elements: Array<any>): boolean => {
    return elements == null || elements.length == 0;
}
