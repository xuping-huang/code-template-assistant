/**
* Get children list by tree array
*
* @param {Array} treeArrays - The array of tree list
* @returns Return a array with the sub node in children prop
*/
{{ facadeMethod }}: function (treeArrays) {
  var ret = []
  let treeIdMap = {{ methodCaller }}{{ getTreeIdMap }}(treeArrays)
  let childrenMap = {{ methodCaller }}{{ getChildrenMap }}(treeArrays)
  let createdMap = new Map()
  treeArrays.forEach((item, index) => {
    {{ methodCaller }}{{ createDirNode }}(item, treeIdMap, childrenMap, createdMap, ret, null)
  })
  return ret
},

/**
* Change Array to Map with (Key=a property of array item, value = array item)
*
* @param {Array} directories - The array of tree list
* @returns Return a map (Key=a property of array item, value = array item)
*/
{{ getTreeIdMap }}: function (treeArrays) {
  let idMap = new Map()
  
  treeArrays.forEach((item) => {
    idMap.set(item.{{ treeIdPropName }}, item)
  })

  return idMap
},

{{ getChildrenMap }}: function (treeArrays) {
  let childrenMap = new Map()
  treeArrays.forEach((item) => {
    if (item.{{ treeParentPropName }}) {
      if (childrenMap.has(item.{{ treeParentPropName }})) {
        childrenMap.get(item.{{ treeParentPropName }}).push(item.{{ treeIdPropName }})
      } else {
        childrenMap.set(item.{{ treeParentPropName }}, [item.{{ treeIdPropName }}])
      }
    }
  })

  return childrenMap
},

{{ createDirNode }}: function (item, treeIdMap, childrenMap, createdMap, childrenSet, parentId) {
  if (createdMap.has(item.{{ treeIdPropName }})) return
  
  // 如果需要，在这里增加树节点属性的处理逻辑
  var href = '#'

  // 这里是返回的树节点的结构，可以根据需要更改属性名，以符合实际要求
  // children属性名称不要调整
  let obj = {
    name: item.{{ treeNameProp }},
    nodeId: item.{{ treeIdPropName }},
    href,
    {{ chlidrenProp }}: []
  }

  createdMap.set(obj.{{ treeIdPropName }}, obj)
  if (item.{{ treeParentPropName }} === parentId) {
    childrenSet.push(obj)
  }

  if (childrenMap.has(item.{{ treeIdPropName }})) {
    let childrenIds = childrenMap.get(item.{{ treeIdPropName }})
    childrenIds.forEach(id => {
      let childrenItem = treeIdMap.get(id)
      this.{{ createDirNode }}(childrenItem, treeIdMap, childrenMap, createdMap, obj.{{ chlidrenProp }}, obj.{{ treeIdPropName }})
    })
  }
}
