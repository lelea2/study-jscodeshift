const { getParser } = require('codemod-cli').jscodeshift;
const { getOptions } = require('codemod-cli');

module.exports = function transformer(file, api) {
  const j = getParser(api);
  const options = getOptions();

  return j(file.source)
    .find(j.Identifier)
    .forEach(path => {
      path.node.name = path.node.name
        .split('')
        .reverse()
        .join('');
    })
    .toSource();
}

export default (fileInfo, api) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // find declaration for &quot;geometry&quot; import
  const importDeclaration = root.find(j.ImportDeclaration, {
    source: {
      type: 'Literal',
      value: 'geometry',
    },
  });

  // get the local name for the imported module
  const localName =
    // find the Identifier
    importDeclaration.find(j.Identifier)
    // get the first NodePath from the Collection
    .get(0)
    // get the Node in the NodePath and grab its &quot;name&quot;
    .node.name;

  return root.find(j.MemberExpression, {
      object: {
        name: localName,
      },
      property: {
        name: 'circleArea',
      },
    })

    .replaceWith(nodePath => {
      // get the underlying Node
      const { node } = nodePath;
      // change to our new prop
      node.property.name = 'getCircleArea';
      // replaceWith should return a Node, not a NodePath
      return node;
    })

    .toSource();
};
