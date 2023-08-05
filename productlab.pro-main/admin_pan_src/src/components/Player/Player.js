import { useReducer, useRef, memo } from "react";
import ReactPlayer from "react-player";
import { INITIAL_STATE, reducer } from "./Player.reducer";

import "./Player.css";

const Player = memo((props) => {
  const { url, light, defaultPlayedSeconds = 0, onChangeProgress } = props;
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const playerRef = useRef(null);
  const wrapperRef = useRef(null);

  const handlePreview = () => {
    dispatch({ type: "PLAY" });
    dispatch({ type: "LIGHT", payload: false });
  };

  const handlePause = () => {
    dispatch({ type: "PAUSE" });
  };

  const handlePlay = () => {
    dispatch({ type: "PLAY" });
  };

  const onReady = (player) => {
    if (defaultPlayedSeconds) {
      player.seekTo(defaultPlayedSeconds, "seconds");
    }
  };

  const handleEnded = () => {
    dispatch({ type: "LIGHT", payload: true });
    playerRef.current?.showPreview();
  };

  const handleProgress = (progress) => {
    onChangeProgress(progress.playedSeconds);
    dispatch({ type: "SEEK", payload: progress.playedSeconds });
  };

  const handleDuration = (duration) => {
    dispatch({ type: "DURATION", payload: duration });
  };
  return (
    <div className="player-wrapper" ref={wrapperRef}>
      <ReactPlayer
        playsinline
        ref={playerRef}
        className="react-player"
        url={url}
        width="100%"
        height="100%"
        light={light}
        controls={state.controls}
        loop={state.loop}
        muted={state.muted}
        playing={state.playing}
        progressInterval={5000}
        volume={state.volume}
        onReady={onReady}
        onPlay={handlePlay}
        onEnded={handleEnded}
        onPause={handlePause}
        onDuration={handleDuration}
        onProgress={handleProgress}
        onClickPreview={handlePreview}
      />
    </div>
  );
});

export { Player };
