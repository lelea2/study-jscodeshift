# study-jscodeshift
Repo prototyping for jscodeship

./node_modules/.bin/jscodeshift -t remove-console.js inputs/remove-console-input.js -d -p

./node_modules/.bin/jscodeshift -t signature-change.js inputs/signature-change-input.js -d -p
```
import car from 'car';

const suv = car.factory({
  color: 'white',
  make: 'Kia',
  model: 'Sorento',
  year: 2010,
  miles: 50000,
  bedliner: null,
  alarm: true,
});
const truck = car.factory({
  color: 'silver',
  make: 'Toyota',
  model: 'Tacoma',
  year: 2006,
  miles: 100000,
  bedliner: true,
  alarm: true,
});
```

./node_modules/.bin/jscodeshift -t method-call-deprecated.js inputs/deprecated-input.js -d -p

./node_modules/.bin/jscodeshift -t map-record.js inputs/map-record-input.js -d -p

./node_modules/.bin/jscodeshift -t map-record-new.js inputs/map-record-input.js -d -p

##### Helpful tools
https://astexplorer.net/#/gist/cb4986b3f1c6eb975339608109a48e7d/85633444a4cd147f7f35799f4628fc34806eeacb
