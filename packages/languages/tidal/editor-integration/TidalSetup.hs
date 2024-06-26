import Control.Concurrent

import Sound.Tidal.Context hiding (startStream, startTidal)
import qualified Sound.Tidal.Stream as Stream

:{
highlightTarget :: Target
highlightTarget = Target {oName = "Text Management Highlights",
                          oAddress = "127.0.0.1",
                          oPort = editorPort,
                          oBusPort = Nothing,
                          oLatency = 0.02,
                          oWindow = Nothing,
                          oSchedule = Pre BundleStamp,
                          oHandshake = False
                         }
:}

:{
startStream :: Config -> [(Target, [OSC])] -> IO Stream
startStream config oscmap
  = do tidal <- Stream.startStream config (oscmap ++ [(highlightTarget, [OSCContext "/highlight"])])
       watchClock tidal
       return tidal
    where
      watchClock :: Stream -> IO ThreadId
      watchClock stream = forkIO checkClock
        where
          checkClock :: IO ()
          checkClock = do time <- streamGetnow stream
                          sendMessage editorSocket (Message "/now" [Float $ realToFrac time])
                          threadDelay 100000
                          checkClock
:}

:{
startTidal :: Target -> Config -> IO Stream
startTidal t c = startStream c [(t, [superdirtShape])]
:}
