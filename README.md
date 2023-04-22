# HTMLCustomTagComponents


## Hexviewer
Here is a live example: [Hexviewer Github Pages](https://bittib010.github.io/HTMLCustomTagComponents/hexviewer/index.html). Try clicking on the sequences that has color. (And do not take any lessons from the information - its copy paste from dummy data and/or partially correct data)

If you want to make an interactive hex-view to show of file headers or anything you've researched, simply add the javascript and the css to get it done.

You can add the hex-view by javascript or html. Here is javascript:

```javascript
<script>
      // create a hex-viewer element
      const hexViewer = document.createElement('hex-viewer');

      // set the hex attribute
      const hex = '48 65 6c 6c 6f 20 57 6f 72 6c 64';
      hexViewer.setAttribute('hex', hex);

      // set the info attribute
      const info = JSON.stringify(
        [
          [0, 3, 'Header'], 
          [4, 10, 'Body']
        ]
        );
      hexViewer.setAttribute('info', info);

      // append the hex-viewer element to the body
      document.body.appendChild(hexViewer);
    </script>
    
```

Or you can add it with html. This way is more proned to errors when formatting is off. All the hex values has to be on the same line, but more importantly, everything has to stay in the same line on the info attribute as well. This makes it harder to read if you've got long strings and long lines.

```html 
<hex-viewer
    hex="FF D8 FF E0 00 10 4A 46 49 46 00 01 01 01 00 00 90 00 00 FF E1 22 45 78 69 66 00 00 4D 4D 00 2A 00 00 00 08 00 01 12 00 03 00 00 00 01 00 01 00 00 00 00 00 00 FF DB 00 43 00 02 01 01 02 01 01 "
    info='[[0, 1, "<ul><li>Length: 2 bytes</li></ul> <br>JPG images always start with the byte sequence 0xFFD8 at the start of image. <br> You can see that the first four bytes have the value 0xFFD8FFE0, which represents the APP0 marker. An APP1 marker would be 0xFFD8FFE1."],[2, 3, "<ul><li>Length: 2 bytes</li></ul> <br>Application UseMarker(APP0 Marker). This is the identifier. This zero-terminatedstring (0xJFIF) uniquely identifies this APP0 marker. This string shall have zero parity (bit 7=0)."],[4, 5, "<ul><li>Length: 2 bytes</li></ul> <br>Length of APP0 Field"],[6, 9, "<ul><li>Length: 5 bytes, but may vary</li></ul> <br>JFIF(zero terminated) Id string."],[10, 11, "<ul><li>Length: 2 bytes</li></ul> <br>JFIF FormatRevision. In other words, this is the version. The major versionequals the most significant byte and the minor version equals theleast significant byte. Which means that 0x0001 is version number1.00."]]'></hex-viewer>
```


Improvements:
- offsets for the hex
- possibility to change width (8, 16, 32)
- Is the sequence number ok as is? I've been thinking of displaying the clicked cell's id (unique iterated) to make it less hard to find.
- Change layout? Maybe a border of some kind
- Make the information widget sticky so that you dont have to scroll backup each time you read a new sequence
