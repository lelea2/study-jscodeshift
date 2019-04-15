export default (fileInfo, api) => {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  root.find(j.ImportDeclaration).at(0).get()
    .insertBefore(
      `import PretenderManager from 'pretender-manager';`
    );
  root.find(j.ImportDeclaration).at(0).get()
    .insertAfter(
      `import { addQueryParams } from 'shared/utils/url';`
    );

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
  function generateRecipes(node1) {
    // console.log(node);
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

  root.find(j.MemberExpression, {
    object: {
      type: '',
      name: ''
    }
  })

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
  // return root.toSource();
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
    // if (arg2.type === 'CallExpression') {
    //   root.find(j.CallExpression, {
    //     callee: {
    //       type: 'Identifier',
    //       name: 'createCompanyWithAdminAccess'
    //     }
    //   })
    //   .replaceWith(nodePath1 => {
    //     arg2 = nodePath1.node.arguments[0];
    //   });
    // }
    const newArg = j.binaryExpression('+', arg0, arg1);

    node.arguments = [
      j.literal('get'),
      j.callExpression(
        j.identifier('addQueryParams'),
        [
          newArg,
          generateRecipes(arg0)
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
