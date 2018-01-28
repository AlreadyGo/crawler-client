export default [
    {
        type:"waitFor",
        selector:"body"
    },
    {
        type: "script",
        async: true,
        timeout: 60,
        func: function(args, target, callback) {
            let result={};
            new $Promise(function(f) {
                if (window.jQuery && window.$) return f(0);
                var script = document.createElement("script");
                script.type = "text/javascript";
                script.onload = f;
                script.src = "//cdn.bootcss.com/jquery/2.1.4/jquery.min.js";
                document.body.appendChild(script);
            }).then(
                ()=>{
                    var first=$(".all-category-action .container").text().trim();
                    var seds=[];
                    if(!first){
                        first=$(".ch-menu-head-title").text().replace(/[\n\s]+/g,"");
                        if(first){
                            $(".ch-menu-body .ch-menu-item").each((i,v)=>{
                                var $v=$(v),sed={},children1=[];
                                sed.name=$v.find(".ch-menu-item-title").text().trim().replace(/[\n\s]+/g,"");
                                $v.find("li a").each((i1,v1)=>{
                                    children1.push(v1.text)
                                });
                                sed.children=children1;seds.push(sed);
                            })
                        }else{
                            first=$(".ali-nav-list h2.title").text().trim();
                            if(first){
                                $(".category").each((i,v)=>{
                                    var $v=$(v),sed={},children1=[];
                                    sed.name=$v.find("dt.cat-1").text().replace(/[\n\s]+/g,"");
                                    $v.find(".cat-1-list a").each((i1,v1)=>{
                                        children1.push(v1.text)
                                    });
                                    sed.children=children1;seds.push(sed);
                                })
                            }else{
                                $("#mod-catpanel-id li").each((i,v)=>{
                                    var $v=$(v),sed={},children1=[];
                                    sed.name=$v.find("h4 a").text().trim().replace(/[\n\s]+/g,"");
                                    $v.find("p a").each((i1,v1)=>{
                                        children1.push(v1.text)
                                    });
                                    sed.children=children1;seds.push(sed);
                                });
                                if(seds.length===0){
                                    $(".cate-1-li").each((i,v)=>{
                                        var $v=$(v),sed={},children1=[];
                                        sed.name=$v.find(".c-main .cate-1-name .txt").text().trim().replace(/[\n\s]+/g,"");
                                        $v.find(".c-main ul.cate-2 a").each((i1,v1)=>{
                                            children1.push(v1.text)
                                        });
                                        sed.children=children1;seds.push(sed);
                                    });
                                }
                            }
                        }

                    }else {
                        $(".content .zone-cat").each((i,v)=>{
                            var $v=$(v),sed={},children1=[];
                            sed.name=$v.find(".ms-yh a").text().trim().replace(/[\\n\s]+/g,"");
                            $v.find(".zone-content li a").each((i1,v1)=>{
                                children1.push(v1.text)
                            });
                            sed.children=children1;seds.push(sed);
                        });
                    }
                    result.name=args.name;
                    result.url=args.url;
                    result.children=seds;
                    target.data=result;
                    callback();
                }
            )
        }
    }

]