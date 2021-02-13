# React Virtual Piano

A small web application that allows you to play an interactive piano. You can change the intervals, the instrument and the MIDI input. New instruments connected to your computer should be detected automatically. The MIDI input only works for chromium based browsers at the moment. The mouse input should work normally in other browsers.

![webapp screenshot](/virtual-piano.png)

## Running
```
npm start
```

## Some Goals for this project

* mobile support
* improve the UI
* fixing that slow transition when changing the instrument

## Libraries I used

* [JZZ](https://github.com/jazz-soft/JZZ) to receive MIDI messages and deal with device connections.
* [soundfont-player](https://github.com/danigb/soundfont-player) to play sounds provided by [Benjamin Gleitzman](https://github.com/gleitz/midi-js-soundfonts)
