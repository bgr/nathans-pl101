int bgColor=0xFFEEEEEE;
int lineColor=0xFFDDDDDD;
int noteSpacing = 4; // in pixels
int noteStroke = 0;
int noteColor = 0x406699FF;
///////////////////////////

ArrayList notes;

void setup() {
  background(bgColor);
  noLoop();
  clear();
}

/*
void draw() {
  
}
*/


void redrawNotes() {
  int[] r = getPitchRange();
  int minPitch = r[0]; // println("min: " + minPitch);
  int maxPitch = r[1]; // println("max: " + maxPitch);
  int nNotes = maxPitch - minPitch + 1;
  int end = getEnd();
  
  int noteHeight = Math.min(height/nNotes);
  float tickScale = (width-2) / (float)end;
  
  // draw horizontal lines
  stroke(lineColor);
  for(int i=1; i<nNotes; i++) {
    int ypos = noteHeight*i;
    line(0,ypos,width,ypos);
  }
  
  // draw note rectangles
  stroke(noteStroke);
  fill(noteColor);
  Note n;
  for(int i=0; i<notes.size(); i++) {
    n = notes.get(i);
    if(n.pitch < 0) continue;
    rect(n.start*tickScale, height-(n.pitch-minPitch+1)*noteHeight + noteSpacing/2, (n.end-n.start)*tickScale, noteHeight - noteSpacing);
  }
}

void clear() {
  background(bgColor);
  notes = new ArrayList();
}

void addNote(int pitch, int start, int end) {
  Note pt = new Note(pitch,start,end);
  notes.add(pt);
}


int getEnd() {
  int end = 0;
  for(int i=0; i<notes.size(); i++) {
    if(notes.get(i).end > end) end = notes.get(i).end;
  }
  return end;
}

int getPitchRange() {
  int low = ~(1 << 31); // Integer.MAX_VALUE
  int high = 1 << 31; // Integer.MIN_VALUE
  Note note;
  for(int i=0; i<notes.size(); i++) {
    note = notes.get(i);
    if(note.pitch < low && note.pitch > 0) low = note.pitch;
    if(note.pitch > high) high = note.pitch;
  }
  return [low, high]; // maybe incompatible with Java, works in JS
}

 
class Note {
  int pitch,start,end;
  Note(int pitch, int start, int end) { this.pitch=pitch; this.start=start; this.end=end;}
}
