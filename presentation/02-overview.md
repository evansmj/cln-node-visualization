# CoreLN Web Apps Overview

## Previous Work
- [@jb55](https://satellite.earth/@jb55@jb55.com)
  - [Lightning as a communication layer talk](https://www.youtube.com/watch?v=76KWXa-6s30)
  - [Lnlink](https://github.com/jb55/lnlink) iOS app to control a CoreLN node
  - [Lnlink.org](http://lnlink.org/) (serverless checkout)
  - [Lnsocket](https://github.com/jb55/lnsocket) Library for connecting to a node

## Why Web Apps?
- No need to worry about app store censorship
- Faster iterations
- Works on any device that has a web browser
- Lightweight (~2mb-4mb)
- PWA's have most of the native features needed (on Android at least and improving slowly on iOS)

## How Does It Work?
- Lightning peer connection using encrypted messages ([Lnmessage](https://github.com/aaronbarnardsound/lnmessage))
- Remote RPC calls using bearer tokens with fine grained permissions control ([Commando](https://docs.corelightning.org/reference/lightning-commando))

## Alternatives
- [Lnsocket](https://github.com/jb55/lnsocket)
- [WebLn](https://webln.dev/#/)
  - [Alby](https://getalby.com/)