<script>
	import browser from 'webextension-polyfill';
	let links = [];

	browser.runtime.onMessage.addListener((message) => {
		if (message.action === 'update') {
			links = message.links;
		}
	});

	async function getStartStatus() {
		const tabs = await browser.tabs.query({ active: true, currentWindow: true });
		const response = await browser.tabs.sendMessage(tabs[0].id, { action: 'status' });
		return response.started;
	}

	function downloadLinksToFile(links) {
		const filename = 'media_links.txt';
		const content = links.join('\n');
		const blob = new Blob([content], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();

		setTimeout(() => {
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}, 0);
	}

</script>

<div class="p-4 bg-black text-white">
	<div class="text-2xl text-center font-bold mb-4">
		Link2Copy
		<div class="text-xs">By Known Black Hat</div>
	</div>

	{#await getStartStatus()}
		Getting status
	{:then stat}
		{#if stat}
			<div class="text-center text-blue-600 m-2">
				Links Found: {links.length}
			</div>
			<button
				on:click={(e) => {
					navigator.clipboard.writeText(links.sort().join('\n'));
					e.target.innerText = 'Copied';
					setTimeout(() => {
						e.target.innerText = 'Copy';
					}, 1000);
				}}
				class="bg-gray-500 p-2 hover:bg-green-600 text-white rounded text-sm"
			>
				Copy
			</button>
			<button
				on:click={(e) => {
					downloadLinksToFile(links.sort());
					e.target.innerText = 'Downloaded';
					setTimeout(() => {
						e.target.innerText = 'Download';
					}, 1000);
				}}
				class="bg-gray-500 p-2 hover:bg-yellow-600 text-white rounded text-sm"
			>
				Download
			</button>

			<button
				on:click={(e) => {
					e.target.innerText = 'Stopped';
					e.target.disabled = true;
					browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
						browser.tabs.sendMessage(tabs[0].id, { action: 'stop' });
					});
					browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
						browser.tabs.sendMessage(tabs[0].id, { action: 'stopautoscroll' });
					});
					window.close();
				}}
				class="bg-gray-500 p-2 hover:bg-red-600 text-white rounded text-sm"
			>
				Stop
			</button>

            <button
                on:click={(e) => {
                    e.target.disabled = true;
                    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                        browser.tabs.sendMessage(tabs[0].id, { action: 'autoscroll' })})}}
				class="bg-gray-500 p-2 hover:bg-blue-600 text-white rounded text-sm"
            >
                Auto Scroll
            </button>
		{:else}
			<div class="text-center">
				<button
					on:click={(e) => {
						e.target.innerText = 'Started';
						e.target.disabled = true;
						browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
							browser.tabs.sendMessage(tabs[0].id, { action: 'start' });
						});
						window.close();
					}}
					class="bg-gray-500 text-center p-2 hover:bg-blue-600 text-white rounded text-sm"
				>
					Start
				</button>
			</div>
		{/if}
	{:catch e}
		<div class="text-center text-red-600">
        {e}
			Only works on <a href="https://discord.com/channels/@me">Discord</a>
		</div>
	{/await}
</div>
