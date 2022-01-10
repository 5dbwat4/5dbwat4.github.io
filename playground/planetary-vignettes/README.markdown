# Planetary Vignettes
 _A Pen created at CodePen.io. Original URL: [https://codepen.io/sweaver2112/pen/wvayoKB](https://codepen.io/sweaver2112/pen/wvayoKB).

 Generated WebGL "planetoid"  style animated patterns.   Click anywhere for new planetoid, or engage the Demo Mode for a fresh pattern every few seconds.

Advanced (Debug) Panel:  This panel displays the long  series of randomized twiddle factors that make up a pattern. The string  values (`numerator`,`denominator` , etc) are GLSL fragments that are compiled directly into the webGL program.   While the advanced panel can certainly be used to tinker with patterns, it is mostly for debug purposes.  

The operands in these string fragments are the following variables in the code: `col1` (color1),`col2` (color2),`col2` (color3), `s1` (shape1, calculated from color1), `s2` (shape2), `s3` (shape3),  `s4` (shape4, calculated from all colors), `dArg` (distance from center), and `surface` (thin layer at planet surface), and `tri1-tri4`, which are triangle shapes.