# immutable-kv
A js module for Valve KV format. Support `#base` feature.

## Install
```bash
npm install immutable-kv
```
## Import
```javascript
import KV from 'immutable-kv';
```

## KV Parser
#### parse
Use `parse` function to convert string to KV instance:
```javascript
const kv = KV.parse(`
"root" {
	"aaa"	"bbb"
	"ccc"	"ddd"
}
`);

kv.key; // 'root'
kv.isList; // true
kv.get(['aaa']); // 'bbb'
kv.getKV(['ccc']).key; // 'ccc'
kv.getKV(['ccc']).value; // 'ddd'
kv.getKV(['ccc']).isList; // false
```

#### update
Call `setValue` to get new KV instance.
The same as `setKey` and `setComment`:
```javascript
const kv = KV.parse('"aaa" "bbb"');
const newKv = kv.setValue('ccc');

kv.value; // 'bbb'
newKv.value; // 'ccc'
```

## KV File
### load
Call `load` to load kv data from file:
```javascript
const kv = KV.load('/tmp/kv.txt');
```

Or you can set customize encoding:
```javascript
const kv = KV.load('/tmp/kv.txt', 'utf8');
```

### `#base` support
```javascript
const kvFileInfo = KV.baseLoad('/tmp/kv.txt');
kvFileInfo.kv; // KV instance
kvFileInfo.path; // Absolute path
kvFileInfo.baseList; // List contains base refer KVFileInfo
kvFileInfo.baseList[0].kv; // Base KV instance
kvFileInfo.baseList[0].relativePath; // Path related to parent KV file
```

### update kv
```javascript
const newKvFileInfo = kvFileInfo.setKV(newKV);
```

### update base kv
##### setBase(origin: index | KV | KVFileInfo, target: KV | KVFileInfo)
```javascript
const newKvFileInfo = kvFileInfo.setBase(origin, target);
```

