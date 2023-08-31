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

browser.runtime.onMessage.addListener((message) => {
	if (message.action === 'getLinks') {
		return Promise.resolve({ success: true, links: totalLinks });
	} else if (message.action === 'start') {
		cls = setInterval(() => {
			totalLinks = [...new Set([...totalLinks, ...extractLinks()])];
			browser.runtime.sendMessage({ action: 'update', links: totalLinks });
		}, 100);
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
        document.querySelector('.scroller-kQBbkU').scrollTo(500,0)}, 200);
    } else if (message.action === 'stopautoscroll') {
        console.log('stop autoscroll');
        clearInterval(autoScroll);
        autoScroll = null;
    }
});
