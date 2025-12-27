import React, { useEffect, useRef, useState } from 'react';

const VideoFeed = ({ track, isLocal = false, consumer }) => {
  const videoRef = useRef(null);
  const [needsInteraction, setNeedsInteraction] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [videoError, setVideoError] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !track) {
      console.log('❌ No video element or track');
      return;
    }

    console.log(`✅ Setting up track ${track.id}:`, {
      readyState: track.readyState,
      enabled: track.enabled,
      muted: track.muted,
      kind: track.kind
    });

    let isMounted = true;
    let metadataTimeout;

    // ✅ Attach ALL event listeners BEFORE setup
    const handleLoadedMetadata = () => {
      clearTimeout(metadataTimeout);
      console.log('📊 Video metadata loaded:', {
        width: videoEl.videoWidth,
        height: videoEl.videoHeight
      });
      
      if (isMounted) {
        setDimensions({
          width: videoEl.videoWidth,
          height: videoEl.videoHeight
        });
      }
    };

    const handleCanPlay = async () => {
      console.log('✅ Video can play');
      if (!isMounted) return;

      try {
        await videoEl.play();
        console.log('✅ Video playing');
        if (isMounted) {
          setIsPlaying(true);
          setNeedsInteraction(false);
        }
      } catch (playError) {
        if (playError.name === 'NotAllowedError') {
          console.warn('⚠️ Autoplay blocked');
          if (isMounted) setNeedsInteraction(true);
        } else if (playError.name !== 'AbortError') {
          console.error('❌ Play error:', playError);
        }
      }
    };

    const handlePlay = () => {
      console.log('▶️ Playing');
      if (isMounted) setIsPlaying(true);
    };

    const handlePause = () => {
      console.log('⏸️ Paused');
      if (isMounted) setIsPlaying(false);
    };

    const handleError = () => {
      console.error('❌ Video error:', videoEl.error);
      if (isMounted) setVideoError(videoEl.error?.message || 'Playback error');
    };

    const handleTrackMute = () => {
      console.log('🔇 Track muted - re-enabling');
      track.enabled = true;
    };

    const handleTrackUnmute = () => {
      console.log('🔊 Track unmuted');
    };

    const handleTrackEnded = () => {
      console.log('🛑 Track ended');
      if (isMounted) setVideoError('Stream ended');
    };

    // ✅ Attach all listeners FIRST
    videoEl.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoEl.addEventListener('canplay', handleCanPlay);
    videoEl.addEventListener('play', handlePlay);
    videoEl.addEventListener('pause', handlePause);
    videoEl.addEventListener('error', handleError);
    
    track.addEventListener('mute', handleTrackMute);
    track.addEventListener('unmute', handleTrackUnmute);
    track.addEventListener('ended', handleTrackEnded);

    const setupVideo = async () => {
      try {
        // ✅ Resume consumer first
        if (consumer) {
          console.log('📋 Consumer state:', {
            id: consumer.id,
            paused: consumer.paused,
            closed: consumer.closed
          });

          if (consumer.paused && typeof consumer.resume === 'function') {
            await consumer.resume();
            console.log('✅ Consumer resumed');
          }
        }

        if (!isMounted) return;

        // ✅ Force track enabled BEFORE creating stream
        track.enabled = true;
        
        // ✅ Create stream and attach
        const stream = new MediaStream([track]);
        videoEl.srcObject = stream;
        
        console.log('🎥 Stream created and attached:', {
          id: stream.id,
          active: stream.active,
          tracks: stream.getTracks().length,
          trackEnabled: track.enabled,
          trackMuted: track.muted
        });

        // ✅ Set timeout AFTER attaching stream
        metadataTimeout = setTimeout(() => {
          if (isMounted) {
            console.error('❌ Metadata timeout - video not loading');
            setVideoError('Video failed to load');
          }
        }, 5000);

      } catch (err) {
        console.error('❌ Setup error:', err);
        if (isMounted) {
          setVideoError(err.message);
        }
      }
    };

    // Start setup
    setupVideo();

    // Cleanup
    return () => {
      console.log('🧹 Cleanup');
      isMounted = false;
      clearTimeout(metadataTimeout);

      videoEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoEl.removeEventListener('canplay', handleCanPlay);
      videoEl.removeEventListener('play', handlePlay);
      videoEl.removeEventListener('pause', handlePause);
      videoEl.removeEventListener('error', handleError);

      track.removeEventListener('mute', handleTrackMute);
      track.removeEventListener('unmute', handleTrackUnmute);
      track.removeEventListener('ended', handleTrackEnded);

      if (videoEl) {
        videoEl.pause();
        videoEl.srcObject = null;
      }
    };
  }, [track, consumer]);

  const handleManualPlay = async () => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    try {
      if (consumer && consumer.paused && typeof consumer.resume === 'function') {
        await consumer.resume();
      }

      if (track) track.enabled = true;

      await videoEl.play();
      setNeedsInteraction(false);
      setIsPlaying(true);
      console.log('✅ Manual play');
    } catch (error) {
      console.error('❌ Manual play failed:', error);
    }
  };

  return (
    <div className="relative bg-gray-900 rounded-lg overflow-hidden w-64 h-48 m-2 border border-gray-700 shadow-lg">
      <video 
        ref={videoRef} 
        className={`w-full h-full object-cover ${isLocal ? 'transform scale-x-[-1]' : ''}`}
        playsInline 
        autoPlay
        muted={isMuted}
      />

      {/* Status */}
      <div className="absolute top-2 left-2 flex gap-1 text-xs">
        {isPlaying && (
          <span className="bg-green-600 text-white px-2 py-1 rounded">
            ● LIVE
          </span>
        )}
        {dimensions.width > 0 && (
          <span className="bg-blue-600 text-white px-2 py-1 rounded">
            {dimensions.width}x{dimensions.height}
          </span>
        )}
      </div>

      {videoError && (
        <div className="absolute top-0 left-0 right-0 bg-red-600 text-white text-xs p-1 text-center">
          {videoError}
        </div>
      )}

      {needsInteraction && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-80 z-10">
          <button 
            onClick={handleManualPlay}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-bold"
          >
            ▶ Play Video
          </button>
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
        {isLocal ? "You" : "Participant"}
      </div>

      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-2 right-2 bg-black bg-opacity-60 text-white px-2 py-1 rounded-full"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>
    </div>
  );
};

export default VideoFeed;