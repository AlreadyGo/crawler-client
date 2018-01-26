var config = [{
		type: "waitFor",
		selector: "body .WB_miniblog .mod_info",
		timeout: 30
	}, {
		type: 'script',
		async: true,
		timeout: 60,
		func: function(args, target, callback) {
			new Promise(function(f) {
				if (window.jQuery && window.$) return f(0);
				var script = document.createElement("script");
				script.type = "text/javascript";
				script.onload = f;
				script.src = "//cdn.bootcss.com/jquery/2.1.4/jquery.min.js";
				document.body.appendChild(script);
			}).then(() => {
				var html = $('body .WB_miniblog');

				function transform(t) {
					var r = [];
					t.find('dd.mod_info').each((i, v) => {
						var o = {},
							$t = $(v);
						o.name = $t.find('.info_name a strong').text();
						o.url = $t.find('.info_name a').attr('href');
						o.connect = $t.find('.info_connect span:eq(0) .count').text();
						o.fans = $t.find('.info_connect span:eq(1) .count').text();
						o.weibo = $t.find('.info_connect span:eq(2) .count').text();
						o.address = $t.find('.info_add span').text();
						o.intro = $t.find('.info_intro span').text();
						r.push(o)
					});
					return r;
				}
				target.data = transform(html);
				callback();
			});

		}
	}

]

let result = {};

function executeAll(url, index, cat, webViewOrder, retry) {
	return new Promise(f => setTimeout(f, 1000 * Math.random())).then(() =>
		runConfig(config, {
			url: `${url}?page=${index}`
		}, webViewOrder).then(
			({
				data
			}) => {
				if (data.length > 0) {
					if (!result[cat]) result[cat] = [];
					result[cat] = [...result[cat], ...data]
					executeAll(url, index + 1, cat, webViewOrder, 0)
				} else {
					Promise.resolve(0);
				}
			}).catch((e) => {
			if (retry < 3) {
				executeAll(url, index, cat, webViewOrder, retry + 1);

			}else{
				throw e.toString();
			}
		})
	)

}

resetWebpage(5);

var entries = [{url:'https://d.weibo.com/1087030002_2975_2020_0',cat:'运动健身'},{url:'https://d.weibo.com/1087030002_2975_2016_0',cat:'教育'},{url:'https://d.weibo.com/1087030002_2975_5014_0',cat:'宗教'},{url:'https://d.weibo.com/1087030002_2975_5006_0',cat:'汽车'},{url:'https://d.weibo.com/1087030002_2975_2006_0',cat:'美女'}]

entries.forEach((entry,index)=>{executeAll(entry.url,1,entry.cat,index,0);});
