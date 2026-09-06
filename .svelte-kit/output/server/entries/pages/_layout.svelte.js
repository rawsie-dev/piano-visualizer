import { a as head, y as attr } from "../../chunks/server.js";
//#region src/lib/assets/favicon.svg
var favicon_default = "data:image/svg+xml,%3csvg%20width='512'%20height='512'%20viewBox='0%200%20512%20512'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3e%3crect%20x='448'%20y='248'%20width='64'%20height='264'%20fill='%235BE4FF'/%3e%3cpath%20d='M408%200C465.438%200%20512%2046.5624%20512%20104C512%20161.438%20465.438%20208%20408%20208C364.737%20208%20327.646%20181.583%20311.973%20144H394V143.989C415.716%20143.556%20433.187%20125.82%20433.187%20104C433.187%2082.1804%20415.716%2064.443%20394%2064.0098V64H311.973C327.646%2026.4172%20364.737%200%20408%200Z'%20fill='%235BE4FF'/%3e%3cpath%20d='M408%20144C465.438%20144%20512%20190.562%20512%20248C512%20291.263%20485.583%20328.353%20448%20344.026V248C448%20226.243%20430.629%20208.542%20409%20208.012V208H311.973C327.646%20170.417%20364.737%20144%20408%20144Z'%20fill='%235BE4FF'/%3e%3crect%20width='404'%20height='64'%20fill='%235BE4FF'/%3e%3cpath%20d='M64%20144H398V208H64V326H0V0H64V144Z'%20fill='%235BE4FF'/%3e%3crect%20x='90'%20y='352'%20width='86'%20height='64'%20fill='%235BE4FF'/%3e%3cpath%20d='M64%20314.187C64%20335.173%2081.0132%20352.187%20102%20352.187H176.187C165.031%20389.216%20130.666%20416.187%2090%20416.187C40.2944%20416.187%200%20375.892%200%20326.187C0%20285.521%2026.9707%20251.155%2064%20240V314.187Z'%20fill='%235BE4FF'/%3e%3c/svg%3e";
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	let { children } = $$props;
	head("12qhfyh", $$renderer, ($$renderer) => {
		$$renderer.push(`<link rel="icon" type="image/svg+xml"${attr("href", favicon_default)}/>`);
	});
	children($$renderer);
	$$renderer.push(`<!---->`);
}
//#endregion
export { _layout as default };
