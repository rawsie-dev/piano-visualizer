import "../../chunks/index-server.js";
import { a as head, i as ensure_array_like, n as attr_style, r as derived, s as stringify, t as attr_class } from "../../chunks/server.js";
import "@tonejs/midi";
import "tone";
//#endregion
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const trackColors = [
			{
				white: "#5be4ff",
				black: "#00a8c9",
				whiteActive: "#5be4ff",
				blackActive: "#00a8c9"
			},
			{
				white: "#ffcdfe",
				black: "#FFA9FD",
				whiteActive: "#ffcdfe",
				blackActive: "#FFA9FD"
			},
			{
				white: "#d9c2ff",
				black: "#35205c",
				whiteActive: "#d9c2ff",
				blackActive: "#9b6cff"
			},
			{
				white: "#b8f5c8",
				black: "#1d4d2b",
				whiteActive: "#b8f5c8",
				blackActive: "#55c978"
			}
		];
		function getTrackColors(trackIndex) {
			return trackColors[trackIndex % trackColors.length];
		}
		function getActiveTrackForKey(midi) {
			const activeTracks = visibleNotes().filter((note) => note.midi === midi && note.time <= currentTime && note.time + note.duration > currentTime).map((note) => note.trackIndex);
			if (activeTracks.length === 0) return null;
			return Math.min(...activeTracks);
		}
		let visualNotes = [];
		function isBlackKey(midi) {
			const pitchClass = midi % 12;
			return [
				1,
				3,
				6,
				8,
				10
			].includes(pitchClass);
		}
		const whiteKeyMidis = [];
		const blackKeyMidis = [];
		function getNotePosition(midi) {
			const whiteKeyIndex = whiteKeyMidis.indexOf(midi);
			if (whiteKeyIndex !== -1) return (whiteKeyIndex + .5) / whiteKeyMidis.length * 100;
			return whiteKeyMidis.filter((key) => key < midi).length / whiteKeyMidis.length * 100;
		}
		for (let midi = 21; midi <= 108; midi++) if (isBlackKey(midi)) blackKeyMidis.push(midi);
		else whiteKeyMidis.push(midi);
		let currentTime = 0;
		let visibleNotes = derived(() => visualNotes.filter((note) => note.time + note.duration >= currentTime && note.time <= 8));
		const pixelsPerSecond = 180;
		function getBlackKeyPosition(midi) {
			return whiteKeyMidis.filter((key) => key < midi).length / whiteKeyMidis.length * 100;
		}
		head("1uha8ag", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title> Piano - Rawsie </title>`);
			});
		});
		$$renderer.push(`<div class="app svelte-1uha8ag"><div class="visualizer svelte-1uha8ag"><div class="notes svelte-1uha8ag"><!--[-->`);
		const each_array = ensure_array_like(visibleNotes());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let note = each_array[$$index];
			$$renderer.push(`<div${attr_class("note svelte-1uha8ag", void 0, { "black-note": isBlackKey(note.midi) })}${attr_style(` left: ${stringify(getNotePosition(note.midi))}%; bottom: ${stringify(120 + (note.time - currentTime) * pixelsPerSecond)}px; height: ${stringify(Math.max(note.duration * pixelsPerSecond, 4))}px; background: ${stringify(isBlackKey(note.midi) ? getTrackColors(note.trackIndex).black : getTrackColors(note.trackIndex).white)}; `)}></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="keyboard svelte-1uha8ag"><div class="white-keys svelte-1uha8ag"><!--[-->`);
		const each_array_1 = ensure_array_like(whiteKeyMidis);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let key = each_array_1[$$index_1];
			const activeTrack = getActiveTrackForKey(key);
			$$renderer.push(`<div class="white-key svelte-1uha8ag"${attr_style(` background: ${stringify(activeTrack !== null ? getTrackColors(activeTrack).whiteActive : "#f4f4f4")}; `)}></div>`);
		}
		$$renderer.push(`<!--]--></div> <div class="black-keys svelte-1uha8ag"><!--[-->`);
		const each_array_2 = ensure_array_like(blackKeyMidis);
		for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
			let key = each_array_2[$$index_2];
			const activeTrack = getActiveTrackForKey(key);
			$$renderer.push(`<div class="black-key svelte-1uha8ag"${attr_style(` left: ${stringify(getBlackKeyPosition(key))}%; background: ${stringify(activeTrack !== null ? getTrackColors(activeTrack).blackActive : "#252525")}; `)}></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div> `);
		$$renderer.push(`<!--[-1--><p>Loading MIDI...</p>`);
		$$renderer.push(`<!--]--> <div class="next-track-container svelte-1uha8ag"><button class="next-track">Next track</button></div></div>`);
	});
}
//#endregion
export { _page as default };
