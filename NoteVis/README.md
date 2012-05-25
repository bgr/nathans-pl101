NoteVis - note visualization
============================

HTML5 canvas (using [Processing.js][pjs]) visualization of notes described by output from MUS compiler from homework 2.

Visualization is utilized on MUS homeworks [showcase page][muspage]. These demo files show how to send note array to Processing.js applet, and how to correctly resize the applet to fill the container div on page load and on browser window resize. Resizing is throttled so it doesn't happen on every pixel changed, but every *n* milliseconds while the resizing is being performed.

Note that pages using Processing.js have to be loaded from a web server in order to be displayed correctly, opening html file locally from filesystem will not work due to browser security.



[pjs]: http://processingjs.org
[muspage]: http://bgr.github.com/nathans-pl101/homework04-mus/