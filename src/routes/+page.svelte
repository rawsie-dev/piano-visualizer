<script lang="ts">
	import { onMount } from 'svelte';
	import Awakening from '$lib/assets/midi/Awakening.mid';
  import Rawsie from '$lib/assets/midi/Rawsie.mid';
	import { Midi } from '@tonejs/midi';
	import * as Tone from 'tone';

  const tracks = [Awakening, Rawsie];
  let currentTrackIndex = $state(1);

	type MidiEvent =
		| {
				type: 'noteOn';
				time: number;
				note: string;
				midi: number;
				duration: number;
				velocity: number;
        trackIndex: number;
		  }
		| {
				type: 'noteOff';
				time: number;
				note: string;
				midi: number;
        trackIndex: number;
		  }
		| {
				type: 'pedalDown';
				time: number;
        trackIndex: number;
		  }
		| {
				type: 'pedalUp';
				time: number;
        trackIndex: number;
		  };

  type VisualNote = {
    id: number;
    trackIndex: number;
    midi: number;
    name: string;
    time: number;
    duration: number;
    velocity: number;
  };

  type TrackColors = {
    white: string;
    black: string;
    whiteActive: string;
    blackActive: string;
  };

  const trackColors: TrackColors[] = [
    {
      white: '#5be4ff',
      black: '#00a8c9',
      whiteActive: '#5be4ff',
      blackActive: '#00a8c9'
    },
    {
      white: '#ffcdfe',
      black: '#FFA9FD',
      whiteActive: '#ffcdfe',
      blackActive: '#FFA9FD'
    },
    {
      white: '#d9c2ff',
      black: '#35205c',
      whiteActive: '#d9c2ff',
      blackActive: '#9b6cff'
    },
    {
      white: '#b8f5c8',
      black: '#1d4d2b',
      whiteActive: '#b8f5c8',
      blackActive: '#55c978'
    }
  ];

  function getTrackColors(trackIndex: number): TrackColors {
    return trackColors[trackIndex % trackColors.length];
  }

  function getActiveTrackForKey(midi: number): number | null {
    const activeTracks = visibleNotes
      .filter(
        (note) =>
          note.midi === midi &&
          note.time <= currentTime &&
          note.time + note.duration > currentTime
      )
      .map((note) => note.trackIndex);

    if (activeTracks.length === 0) {
      return null;
    }

    return Math.min(...activeTracks);
  }

	let midiData: Midi | null = $state(null);
  let midiEvents: MidiEvent[] = [];
  let visualNotes: VisualNote[] = $state([]);

  function isBlackKey(midi: number) {
    const pitchClass = midi % 12;

    return [1, 3, 6, 8, 10].includes(pitchClass);
  }

  const whiteKeyMidis: number[] = [];

  const blackKeyMidis: number[] = [];

  function getNotePosition(midi: number) {
    const whiteKeyIndex = whiteKeyMidis.indexOf(midi);

    if (whiteKeyIndex !== -1) {
      return ((whiteKeyIndex + 0.5) / whiteKeyMidis.length) * 100;
    }

    const previousWhiteKey = whiteKeyMidis.filter(
      (key) => key < midi
    ).length;

    return (previousWhiteKey / whiteKeyMidis.length) * 100;
  }

  for (let midi = 21; midi <= 108; midi++) {
    if (isBlackKey(midi)) {
      blackKeyMidis.push(midi);
    } else {
      whiteKeyMidis.push(midi);
    }
  }

	let piano: Tone.Sampler | null = null;

  let animationFrame: number | null = null;

	let currentTime = $state(0);
  let isPlaying = $state(false);
  let isPianoLoaded = $state(false);

  const LOOKAHEAD_SECONDS = 8;

  let visibleNotes = $derived(
    visualNotes.filter(
      (note) =>
        note.time + note.duration >= currentTime &&
        note.time <= currentTime + LOOKAHEAD_SECONDS
    )
  );


	let sustainPedal = false;
  const pixelsPerSecond = 180;
  let isScheduled = false;

	const heldNotes = new Set<string>();
	const sustainedNotes = new Set<string>();

  let pauseReleaseTimer: ReturnType<typeof setTimeout> | null = null;
 
	function cancelPauseReleaseTimer() {
		if (pauseReleaseTimer !== null) {
			clearTimeout(pauseReleaseTimer);
			pauseReleaseTimer = null;
		}
	}

  let isSeeking = false;
  let wasPlayingBeforeSeek = false;
  let seekRAF: number | null = null;
  let pendingSeekTime: number | null = null;
  const previewNotes = new Set<string>();
    

  function updatePlaybackTime() {
    const transport = Tone.getTransport();

    currentTime = transport.seconds;

    if (isPlaying) {
      animationFrame = requestAnimationFrame(updatePlaybackTime);
    }
  }

	async function loadMidi(midiUrl: string) {
		return Midi.fromUrl(midiUrl);
	}

	function createMidiEvents(midi: Midi): MidiEvent[] {
		const events: MidiEvent[] = [];

		for (const [trackIndex, track] of midi.tracks.entries()) {
			for (const note of track.notes) {
				events.push({
					type: 'noteOn',
					time: note.time,
					note: note.name,
					midi: note.midi,
					duration: note.duration,
					velocity: note.velocity,
          trackIndex
				});

				events.push({
					type: 'noteOff',
					time: note.time + note.duration,
					note: note.name,
					midi: note.midi,
          trackIndex
				});
			}

			const sustain = track.controlChanges[64];

			if (sustain) {
				for (const control of sustain) {
					if (control.value >= 0.5) {
						events.push({
							type: 'pedalDown',
							time: control.time,
              trackIndex
						});
					} else {
						events.push({
							type: 'pedalUp',
							time: control.time,
              trackIndex
						});
					}
				}
			}
		}

		events.sort((a, b) => a.time - b.time);

		return events;
	}

  function getBlackKeyPosition(midi: number) {
    const whiteKeysBefore = whiteKeyMidis.filter(
      (key) => key < midi
    ).length;

    return (whiteKeysBefore / whiteKeyMidis.length) * 100;
  }

  async function loadTrack(index: number) {
    const midi = await loadMidi(tracks[index]);

    midiData = midi;
    midiEvents = createMidiEvents(midi);

    let noteId = 0;
    const notes: VisualNote[] = [];

    for (const [trackIndex, track] of midi.tracks.entries()) {
      for (const note of track.notes) {
        notes.push({
          id: noteId++,
          trackIndex,
          midi: note.midi,
          name: note.name,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity
        });
      }
    }

    visualNotes = notes;

    const transport = Tone.getTransport();
    transport.cancel();
    transport.position = 0;
    isScheduled = false;
    currentTime = 0;

    releaseAllNotes();
  }

	onMount(async () => {
    await loadTrack(currentTrackIndex);
    const limiter = new Tone.Limiter(-1).toDestination();

		piano = new Tone.Sampler({
			urls: {
				A0: 'A0.mp3',

				C1: 'C1.mp3',
				'D#1': 'Ds1.mp3',
				'F#1': 'Fs1.mp3',

				A1: 'A1.mp3',

				C2: 'C2.mp3',
				'D#2': 'Ds2.mp3',
				'F#2': 'Fs2.mp3',

				A2: 'A2.mp3',

				C3: 'C3.mp3',
				'D#3': 'Ds3.mp3',
				'F#3': 'Fs3.mp3',

				A3: 'A3.mp3',

				C4: 'C4.mp3',
				'D#4': 'Ds4.mp3',
				'F#4': 'Fs4.mp3',

				A4: 'A4.mp3',

				C5: 'C5.mp3',
				'D#5': 'Ds5.mp3',
				'F#5': 'Fs5.mp3',

				A5: 'A5.mp3',

				C6: 'C6.mp3',
				'D#6': 'Ds6.mp3',
				'F#6': 'Fs6.mp3',

				A6: 'A6.mp3',

				C7: 'C7.mp3',
				'D#7': 'Ds7.mp3',
				'F#7': 'Fs7.mp3',

				A7: 'A7.mp3',
				C8: 'C8.mp3'
			},

			release: 1,

			baseUrl: '/piano/',
      attack: 0.005,

			onload: () => {
				console.log('Piano samples loaded');
				isPianoLoaded = true;
			},

			onerror: (error) => {
				console.error('Failed to load piano sample:', error);
			}
		}).connect(limiter);
	});

  function schedulePlayback() {
    const transport = Tone.getTransport();

    transport.cancel();

    for (const event of midiEvents) {

      if (event.type === 'noteOn') {
        transport.schedule((time) => {
          if (!piano) return;

          heldNotes.add(event.note);
          sustainedNotes.delete(event.note);

          piano.triggerAttack(
            event.note,
            time,
            event.velocity
          );
        }, event.time);
      }

      if (event.type === 'noteOff') {
        transport.schedule((time) => {
          if (!piano) return;

          heldNotes.delete(event.note);

          if (sustainPedal) {
            sustainedNotes.add(event.note);
          } else {
            piano.triggerRelease(event.note, time);
          }
        }, event.time);
      }

      if (event.type === 'pedalDown') {
        transport.schedule(() => {
          sustainPedal = true;
        }, event.time);
      }

      if (event.type === 'pedalUp') {
        transport.schedule((time) => {
          sustainPedal = false;

          for (const note of sustainedNotes) {
            if (!heldNotes.has(note)) {
              piano?.triggerRelease(note, time);
            }
          }

          sustainedNotes.clear();
        }, event.time);
      }
    }

    isScheduled = true;
  }

	async function playMidi() {
		if (!midiData || !piano || !isPianoLoaded) return;

		await Tone.start();

		const transport = Tone.getTransport();

    cancelPauseReleaseTimer();

    if (!isScheduled) {
      transport.stop();
      transport.position = 0;

      sustainPedal = false;
      heldNotes.clear();
      sustainedNotes.clear();

      schedulePlayback();
    }

    transport.start();

    isPlaying = true;

    updatePlaybackTime();
	}

  function pauseMidi() {
    const transport = Tone.getTransport();

    transport.pause();

    isPlaying = false;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
    cancelPauseReleaseTimer();
 
    pauseReleaseTimer = setTimeout(() => {
      pauseReleaseTimer = null;
 
      if (piano) {
        for (const note of heldNotes) piano.triggerRelease(note);
        for (const note of sustainedNotes) piano.triggerRelease(note);
      }
 
      heldNotes.clear();
      sustainedNotes.clear();
      sustainPedal = false;
    }, 1000);
  }

  function releaseAllNotes() {
    if (!piano) return;

    const now = Tone.now();

    for (const note of heldNotes) {
      piano.triggerRelease(note, now);
    }

    for (const note of sustainedNotes) {
      piano.triggerRelease(note, now);
    }

    piano.releaseAll();

    heldNotes.clear();
    sustainedNotes.clear();
    previewNotes.clear();
    sustainPedal = false;
  }

	function stopMidi() {
    const transport = Tone.getTransport();

    transport.stop();
    transport.cancel();
    transport.position = 0;

    cancelPauseReleaseTimer();

    releaseAllNotes();

    isPlaying = false;
    isScheduled = false;
    isSeeking = false;

    currentTime = 0;

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    if (seekRAF !== null) {
      cancelAnimationFrame(seekRAF);
      seekRAF = null;
    }

    window.removeEventListener('pointerup', windowPointerUp);
    window.removeEventListener('pointercancel', windowPointerUp);
  }

  async function nextTrack() {
    stopMidi();

    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;

    await loadTrack(currentTrackIndex);
    releaseAllNotes();
  }

  function getActiveNotesAtTime(time: number): VisualNote[] {
    return visualNotes.filter(
      (note) =>
        note.time <= time &&
        note.time + note.duration > time
    );
  }

  function stopScrubPreview() {
    if (!piano) {
      previewNotes.clear();
      return;
    }

    const now = Tone.now();

    for (const name of previewNotes) {
      piano.triggerRelease(name, now);
    }

    previewNotes.clear();
  }

  function updateScrubPreview(time: number) {
    if (!piano) return;

    const active = getActiveNotesAtTime(time);
    const activeNames = new Set(active.map((note) => note.name));
    const now = Tone.now();

    for (const name of previewNotes) {
      if (!activeNames.has(name)) {
        piano.triggerRelease(name, now);
        previewNotes.delete(name);
      }
    }

    for (const note of active) {
      if (!previewNotes.has(note.name)) {
        piano.triggerAttack(note.name, now, note.velocity * 0.7);
        previewNotes.add(note.name);
      }
    }
  }

  let lastSeekValue = 0;

  function windowPointerUp(event: PointerEvent) {
    commitSeek(event);
  }

  function handleSeekStart(event: PointerEvent) {
    if (!midiData) return;
    if (!isSeeking) {
      wasPlayingBeforeSeek = isPlaying;
    }

    isSeeking = true;
    lastSeekValue = parseFloat((event.target as HTMLInputElement).value);

    cancelPauseReleaseTimer();

    if (isPlaying) {
      Tone.getTransport().pause();
      isPlaying = false;
    }

    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }

    window.addEventListener('pointerup', windowPointerUp);
    window.addEventListener('pointercancel', windowPointerUp);
  }

  function handleSeekInput(event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value);

    if (Number.isNaN(value)) return;

    lastSeekValue = value;
    pendingSeekTime = value;
    currentTime = value;

    if (seekRAF === null) {
      seekRAF = requestAnimationFrame(() => {
        seekRAF = null;

        if (pendingSeekTime !== null) {
          updateScrubPreview(pendingSeekTime);
        }
      });
    }
  }

  function commitSeek(event: Event) {
    if (!isSeeking) return;
    if (!midiData) return;

    const target = event.target as HTMLInputElement | null;
    const targetValue = target ? parseFloat(target.value) : NaN;
    const rawValue = Number.isNaN(targetValue) ? lastSeekValue : targetValue;
    const seekTime = Math.min(Math.max(rawValue, 0), midiData.duration);

    window.removeEventListener('pointerup', windowPointerUp);
    window.removeEventListener('pointercancel', windowPointerUp);

    if (seekRAF !== null) {
      cancelAnimationFrame(seekRAF);
      seekRAF = null;
    }
    pendingSeekTime = null;

    stopScrubPreview();
    piano?.releaseAll();
    heldNotes.clear();
    sustainedNotes.clear();
    sustainPedal = false;

    const transport = Tone.getTransport();
    transport.seconds = seekTime;
    currentTime = seekTime;

    isSeeking = false;

    if (wasPlayingBeforeSeek && isScheduled) {
      transport.start();
      isPlaying = true;
      updatePlaybackTime();
    } else {
      isPlaying = false;
    }
  }
</script>

<svelte:head>
	<title> Piano - Rawsie </title>
</svelte:head>

<div class="app">
<div class="visualizer">
  <div class="notes">
    {#each visibleNotes as note}
      <div
        class="note"
        class:black-note={isBlackKey(note.midi)}
        style="
          left: {getNotePosition(note.midi)}%;
          bottom: {120 + ((note.time - currentTime) * pixelsPerSecond)}px;
          height: {Math.max(note.duration * pixelsPerSecond, 4)}px;
          background: {
            isBlackKey(note.midi) ? getTrackColors(note.trackIndex).black : getTrackColors(note.trackIndex).white
          };
        "
      >
        <!-- {note.name} -->
      </div>
    {/each}
  </div>
	<div class="keyboard">
    <div class="white-keys">
      {#each whiteKeyMidis as key}
        {@const activeTrack = getActiveTrackForKey(key)}

        <div
          class="white-key"
          style="
            background: {activeTrack !== null ? getTrackColors(activeTrack).whiteActive : '#f4f4f4'};
          "
        >
        </div>
      {/each}
    </div>

    <div class="black-keys">
      {#each blackKeyMidis as key}
        {@const activeTrack = getActiveTrackForKey(key)}

        <div
          class="black-key"
          style="
            left: {getBlackKeyPosition(key)}%;
            background: {activeTrack !== null ? getTrackColors(activeTrack).blackActive : '#252525'};
          "
        >
        </div>
      {/each}
    </div>

  </div>
</div>

{#if midiData}
	<div class="playback-controls">
    {#if isPlaying}
      <button onclick={pauseMidi}>
        Pause
      </button>
    {:else}
      <button
        onclick={playMidi}
        disabled={!isPianoLoaded}
      >
        {currentTime > 0 ? 'Resume' : 'Play'}
      </button>
    {/if}

    <button
      onclick={stopMidi}
      disabled={!isPlaying && currentTime === 0}
    >
      Stop
    </button>
  </div>

  <div class="seek-controls">
    <span class="seek-time">{currentTime.toFixed(2)}s</span>

    <input
      class="seek-slider"
      type="range"
      min="0"
      max={midiData.duration}
      step="0.01"
      value={currentTime}
      disabled={!isPianoLoaded}
      onpointerdown={handleSeekStart}
      oninput={handleSeekInput}
      onpointerup={commitSeek}
      onpointercancel={commitSeek}
    />

    <span class="seek-time">{midiData.duration.toFixed(2)}s</span>
  </div>
{:else}
	<p>Loading MIDI...</p>
{/if}
<div class="next-track-container">
  <button class="next-track" onclick={nextTrack}>
    Next track
  </button>
</div>
</div>

<style>
	/* .visualizer {
    width: 100%;
    height: 100dvh;

    margin: 0;
    background: #111;
    position: relative;
    overflow: hidden;
  } */
  .app {
    width: 100%;
    height: 100dvh;

    max-width: 1300px;
    margin: 0 auto;

    display: flex;
    flex-direction: column;

    box-sizing: border-box;
    overflow: hidden;
  }

  .visualizer {
    width: 100%;
    height: 100dvh;
    max-width: 1300px;

    margin: 0 auto;
    background: #111;
    position: relative;
    overflow: hidden;
    text-align: center;
  }

  .playback-controls {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;

    width: 100%;
    max-width: 1300px;
    margin: 10px auto 0;
  }


	.keyboard {
    position: absolute;
    bottom: 0;
    left: 0;

    width: 100%;
    height: 120px;

    z-index: 10;
  }

  .white-keys {
    position: absolute;
    inset: 0;

    display: flex;
  }

  .white-key {
    position: relative;

    height: 100%;
    flex: 1;

    background: #f4f4f4;

    border: 1px solid #777;
    border-bottom: 3px solid #555;

    box-sizing: border-box;

    border-radius: 0;
  }

  .black-keys {
    position: absolute;
    inset: 0;

    pointer-events: none;
  }

  .black-key {
    position: absolute;

    top: 0;

    width: calc(100% / 52 * 0.58);
    height: 72px;

    transform: translateX(-50%);

    background: #252525;

    border: 1px solid #000;
    border-bottom: 3px solid #000;

    border-radius: 0;

    box-sizing: border-box;

    z-index: 2;
  }

  .notes {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .note {
    position: absolute;
    width: calc(100% / 52 * 0.9);
    transform: translateX(-50%);
    border: 2px solid white;
    border-radius: 4px;
    opacity: 1;
    box-sizing: border-box;
    font-size: 10px;
    color: black;
    overflow: hidden;
    pointer-events: none;
  }

  .black-note {
    width: calc(100% / 52 * 0.55);
    border-color: rgba(255, 255, 255, 0.25);
  }

  .seek-controls {
    display: flex;
    align-items: center;
    gap: 10px;

    width: 100%;
    max-width: 1300px;
    margin: 10px auto;
  }

  .seek-slider {
    flex: 1;
  }

  .seek-time {
    font-variant-numeric: tabular-nums;
    font-size: 12px;
    color: #666;
    min-width: 48px;
  }

  .next-track-container {
    display: flex;
    justify-content: center;

    width: 100%;
    max-width: 1300px;
    margin: 10px auto;
  }
</style>