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

export default (fileInfo, api) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

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

  // find declaration for &quot;geometry&quot; import
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

  function generateRecipes(recipeKey) {
    if(recipeKey) {
      return j.objectExpression([
        j.property(
          'init',
          j.identifier('decorationId'),
          j.memberExpression(
            j.identifier('recipes'),
            j.literal(recipeKey),
            true
          )
        )
      ]);
    } else {
      return j.objectExpression([]);
    }
  }

  // root.find(j.MemberExpression, {
  //   object: {
  //     type: 'Identifier',
  //     name: 'endpointMap'
  //   },
  //   property: {
  //     type: 'Identifier',
  //     name: 'organizationCompanies'
  //   }
  // }).replaceWith(nodePath => {
  //   return j.literal('/voyager/api/organization/companies/');
  // });
  root.find(j.CallExpression, {
    callee: {
      type: 'MemberExpression',
      object: {
        name: localName,
      },
      property: {
        name: 'mapRecord',
      },
    }
  }).replaceWith(nodePath => {
    const { node } = nodePath;
    const arg0 = node.arguments[0];
    const arg1 = node.arguments[1];
    let arg2 = node.arguments[2];
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
    const arg = j.binaryExpression('+', arg0, arg1);
    const funcArr = ['organizationCompanies', 'organizationPromotions'];
    const hash = {
      organizationCompanies: {
        url: '/voyager/api/organization/companies/',
        recipeKey: 'com.linkedin.voyager.deco.organization.web.WebCompanyAdmin'
      },
      organizationPromotions: {
        url: '/voyager/api/organization/promotions/',
        recipeKey: 'test'
      }
    };
    for (let i = 0; i < funcArr.length; i++) {
      const propName = funcArr[i];
      console.log(propName);
      root.find(j.MemberExpression, {
        object: {
          type: 'Identifier',
          name: 'endpointMap'
        },
        property: {
          type: 'Identifier',
          name: propName,
        },
      }).replaceWith(temp => {
        node.arguments = [
          j.literal('get'),
          j.callExpression(
            j.identifier('addQueryParams'),
            [
              arg,
              generateRecipes(hash[propName].recipeKey),
            ]
          ),
          // will need to check to change it
          j.callExpression(
            j.identifier('handleMockCreation'),
            [
              j.arrowFunctionExpression(
                [j.identifier('mock')],
                j.callExpression(
                  j.identifier('mock.with'),
                  [ arg2 ]
                )
              )
            ]
          )
        ];
      });
    }

    return node;
  });

  root.find(j.MemberExpression, {
    object: {
      name: localName,
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
};

