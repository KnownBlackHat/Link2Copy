import browser from 'webextension-polyfill';
let totalLinks = [];
let cls = null;
let autoScroll = null;

const extractLinks = () => {
	const regex = /"https?:\/\/[^\s]+\.(mp4|webm|qt|mkv|jpeg|jpg|png|mov|avi)"/gi;
	let links = [...new Set(document.querySelector('main').innerHTML.match(regex))];
	links = links.map((v) => v.replace(/['"]/g, ''));
	return links;
};

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

browser.runtime.onMessage.addListener((message) => {
	if (message.action === 'getLinks') {
		return Promise.resolve({ success: true, links: totalLinks });
	} else if (message.action === 'start') {
		cls = setInterval(() => {
			totalLinks = [...new Set([...totalLinks, ...extractLinks()])];
			browser.runtime.sendMessage({ action: 'update', links: totalLinks });
		}, 100);
		document.onkeydown = (key) => {
			switch (key.key) {
				case 'r':
					totalLinks = [];
					break;
				case 'a':
					if (autoScroll) {
						clearInterval(autoScroll);
						autoScroll = null;
					} else {
						autoScroll = setInterval(() => {
							document.querySelector('.scroller-kQBbkU').scrollTo(500, 0);
						}, 200);
					}
					break;
				case 'd':
					downloadLinksToFile(totalLinks.sort());
					break;
				case 'c':
					navigator.clipboard.writeText(totalLinks.sort().join('\n'));
			}
		};
	} else if (message.action === 'stop') {
		clearInterval(cls);
		cls = null;
		totalLinks = [];
	} else if (message.action === 'status') {
		if (cls) {
			return Promise.resolve({ success: true, started: true });
		} else {
			return Promise.resolve({ success: true, started: false });
		}
	} else if (message.action === 'autoscroll') {
		autoScroll = setInterval(() => {
			document.querySelector('.scroller-kQBbkU').scrollTo(500, 0);
		}, 200);
	} else if (message.action === 'stopautoscroll') {
		console.log('stop autoscroll');
		clearInterval(autoScroll);
		autoScroll = null;
	}
});
