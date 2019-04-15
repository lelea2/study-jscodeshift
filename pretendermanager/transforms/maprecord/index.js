const { getParser } = require('codemod-cli').jscodeshift;
const { getOptions } = require('codemod-cli');

function findImports (j, ast, pkg) {
  return ast.find(j.ImportDeclaration, {
    source: {
      value: pkg
    }
  });
}

/**
 * Detects CommonJS and import statements for the given package.
 * @return true if import were found, else false
 */
function hasRequireOrImport (j, ast, pkg) {
  // const requires = findRequires(j, ast, pkg).size()
  const imports = findImports(j, ast, pkg).size();
  return imports > 0
}

// Function to insert module
function insertModule(root, j) {
  // insert pretender-manager if needed
  if (!hasRequireOrImport(j, root, 'pretender-manager')) {
    root.find(j.ImportDeclaration).at(0).get()
      .insertBefore(
        `import PretenderManager from 'pretender-manager';`
      );
  }

  if(!hasRequireOrImport(j, root, 'shared/utils/url')) {
    root.find(j.ImportDeclaration).at(0).get()
      .insertAfter(
        `import { addQueryParams } from 'shared/utils/url';`
      );
  }

  if(!hasRequireOrImport(j, root, 'data-layers/pillar-recipes/organization/recipes')) {
    root.find(j.ImportDeclaration).at(0).get()
    .insertAfter(
      `import recipes from 'data-layers/pillar-recipes/organization/recipes';`
    );
  }
}

function getLocalName(root, j) {
  const importDeclaration = root.find(j.ImportDeclaration, {
    source: {
      type: 'Literal',
      value: 'lib/mock-server',
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

  return localName;
}

// Transform query
function transFormQuery(node1, node2) {

}

// Helper function to get arglist for render
function getArgsList(root, j) {
  let arg1 = null;
  let arg2 = null;

  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: {
        name: getLocalName,
      },
      property: {
        name: 'mapRecord',
      },
    }
  }).replaceWith(nodePath => {
    const { node } = nodePath;
    const { arguments } = node;
    arg1 = transFormQuery(node.arguments(arguments[0], arguments[1]));
    arg2 = arguments[2];
    if (arg2.type === 'CallExpression') {
      root.find(j.CallExpression, {
        callee: {
          type: 'Identifier',
          name: 'createCompanyWithAdminAccess'
        }
      })
      .replaceWith(nodePath1 => {
        arg2 = nodePath1.node.arguments[0];
      });
    }
  });
}

// Helper function to generate recipes
function generateRecipes(node) {
  return j.objectExpression([
    j.property(
      'init',
      j.identifier('decorationId'),
      j.memberExpression(
        j.identifier('recipes'),
        j.literal('com.linkedin.voyager.deco.organization.web.WebCompanyAdmin'),
        true
      )
    )
  ]);
}

module.exports = function transformer(fileInfo, api) {
  const j = getParser(api);

  const root = j(fileInfo.source);

  // Insert module in front
  insertModule(root, j);

  root.find(j.MemberExpression, {
    object: {
      name: getLocalName(),
    },
    property: {
      name: 'mapRecord',
    },
  })
  .replaceWith(nodePath => {
    // get the underlying Node
    const { node } = nodePath;
    // change to our new prop
    node.property.name = 'setResponseMock';
    node.object.name = 'PretenderManager';
    // replaceWith should return a Node, not a NodePath
    return node;
  });

  return root.toSource({ quote: 'single', trailingComma: true });
}
