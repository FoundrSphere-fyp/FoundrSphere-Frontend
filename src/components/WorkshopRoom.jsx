"use client";
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import VideoFeed from './VideoFeed';

const WorkshopRoom = () => {
    const [isJoined, setIsJoined] = useState(false);
    const [isReady, setIsReady] = useState(false); // ✅ Track if Mediasoup is ready
    const [peers, setPeers] = useState([]);
    const [myProducerId, setMyProducerId] = useState(null); // ✅ Track own producer

    const socketRef = useRef(null);
    const deviceRef = useRef(null);
    const producerTransportRef = useRef(null);
    const consumerTransportRef = useRef(null);

    useEffect(() => {
        socketRef.current = io('http://localhost:8080');

        socketRef.current.on('connect', () => {
            console.log("✅ Connected to WebSocket");
            initializeMediasoup();
        });

        socketRef.current.on('new-producer', ({ producerId }) => {
            console.log('🆕 New producer detected:', producerId);
            // Don't consume your own stream
            if (producerId !== myProducerId) {
                consumeStream(producerId);
            }
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [myProducerId]);

    const initializeMediasoup = async () => {
        socketRef.current.emit('getRouterRtpCapabilities', async (rtpCapabilities) => {
            deviceRef.current = new mediasoupClient.Device();
            await deviceRef.current.load({ routerRtpCapabilities: rtpCapabilities });

            console.log("✅ Mediasoup Device Loaded");

            createSendTransport();
            createRecvTransport();

            // ✅ Get existing producers (other users already streaming)
            socketRef.current.emit('getProducers', (producerIds) => {
                console.log('📋 Existing producers:', producerIds);
                producerIds.forEach((id) => {
                    if (id !== myProducerId) {
                        consumeStream(id);
                    }
                });
            });

            setIsReady(true); // ✅ Show "Start My Camera" button
        });
    };

    const createSendTransport = () => {
        socketRef.current.emit('createWebRtcTransport', { sender: true }, ({ params }) => {
            if (params.error) return console.error(params.error);

            producerTransportRef.current = deviceRef.current.createSendTransport(params);

            producerTransportRef.current.on('connect', ({ dtlsParameters }, callback, errback) => {
                socketRef.current.emit('transport-connect', { dtlsParameters });
                callback();
            });

            producerTransportRef.current.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
                socketRef.current.emit('transport-produce', { kind, rtpParameters }, ({ id }) => {
                    callback({ id });
                });
            });
        });
    };

    const createRecvTransport = () => {
        socketRef.current.emit('createWebRtcTransport', { sender: false }, ({ params }) => {
            if (params.error) return console.error(params.error);

            consumerTransportRef.current = deviceRef.current.createRecvTransport(params);

            consumerTransportRef.current.on('connect', ({ dtlsParameters }, callback, errback) => {
                socketRef.current.emit('transport-connect', { dtlsParameters });
                callback();
            });
        });
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const videoTrack = stream.getVideoTracks()[0];

            const producer = await producerTransportRef.current.produce({ track: videoTrack });
            console.log("✅ Publishing Video:", producer.id);
            
            setMyProducerId(producer.id); // ✅ Store own producer ID
            setIsJoined(true); // ✅ Now hide the button and show video grid

            // ✅ Add own video to peers (optional - if you want to see yourself)
            // setPeers(prev => [...prev, { id: producer.id, track: videoTrack, isLocal: true }]);

        } catch (err) {
            console.error("❌ Failed to start camera:", err);
            alert('Failed to access camera. Please check permissions.');
        }
    };

    const consumeStream = async (producerId) => {
        console.log('🔽 Consuming stream from producer:', producerId);
        
        socketRef.current.emit('transport-consume', {
            producerId,
            rtpCapabilities: deviceRef.current.rtpCapabilities,
        }, async (response) => {
            if (response.error) {
                console.error('❌ Consume error:', response.error);
                return;
            }

            const { params } = response;
            console.log('📥 Received consumer params:', params);
            
            try {
                const consumer = await consumerTransportRef.current.consume({
                    id: params.id,
                    producerId: params.producerId,
                    kind: params.kind,
                    rtpParameters: params.rtpParameters,
                });

                console.log('✅ Consumer created:', {
                    id: consumer.id,
                    kind: consumer.kind,
                    paused: consumer.paused,
                    trackId: consumer.track.id,
                    trackReadyState: consumer.track.readyState
                });

                if (consumer.paused) {
                    console.log('🔄 Resuming consumer (was paused)...');
                    await consumer.resume();
                    console.log('✅ Consumer resumed locally');
                }

                socketRef.current.emit('consumer-resume', { consumerId: consumer.id }, () => {
                    console.log('✅ Server-side consumer resumed');
                });

                consumer.track.enabled = true;
                console.log('✅ Track enabled:', consumer.track.enabled);

                setPeers(prevPeers => {
                    const existingIndex = prevPeers.findIndex(p => p.id === producerId);
                    
                    if (existingIndex >= 0) {
                        console.log('⚠️ Peer already exists, updating...');
                        const updated = [...prevPeers];
                        updated[existingIndex] = { 
                            id: producerId, 
                            track: consumer.track, 
                            consumer 
                        };
                        return updated;
                    }
                    
                    console.log('➕ Adding new peer:', producerId);
                    const newPeers = [
                        ...prevPeers, 
                        { id: producerId, track: consumer.track, consumer }
                    ];
                    console.log('📊 Total peers now:', newPeers.length);
                    return newPeers;
                });

                console.log('✅ Peer added to state with track:', consumer.track.id);

            } catch (error) {
                console.error('❌ Error creating consumer:', error);
            }
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black p-8">
            <h1 className="text-4xl font-bold text-white text-center mb-8">Workshop Room</h1>

            {/* ✅ Show loading state */}
            {!isReady && (
                <div className="text-center text-white">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Initializing...</p>
                </div>
            )}

            {/* ✅ Show button only when ready and not joined */}
            {isReady && !isJoined && (
                <div className="text-center">
                    <button 
                        onClick={startCamera}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition hover:scale-105"
                    >
                        📹 Start My Camera
                    </button>
                </div>
            )}

            {/* ✅ Show video grid only after joining */}
            {isJoined && (
                <div className="flex flex-wrap justify-center gap-4">
                    {peers.length === 0 ? (
                        <div className="text-white text-center">
                            <p className="text-lg mb-2">Waiting for others to join...</p>
                            <p className="text-sm text-gray-400">Active peers: 0</p>
                        </div>
                    ) : (
                        <>
                            {peers.map((peer) => {
                                console.log('Rendering peer:', peer.id, 'has track:', !!peer.track);
                                return (
                                    <VideoFeed 
                                        key={peer.id} 
                                        track={peer.track} 
                                        consumer={peer.consumer}
                                        isLocal={peer.isLocal}
                                    />
                                );
                            })}
                            
                            <div className="w-full text-white text-center text-sm mt-4">
                                Active peers: {peers.length}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default WorkshopRoom;