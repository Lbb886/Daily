var posts=["posts/45395.html","posts/15126.html","posts/19457.html","posts/29222.html","posts/19806.html","posts/46801.html"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };var friend_link_list=[{"name":"Hexo","link":"https://hexo.io/zh-tw/","avatar":"https://d33wubrfki0l68.cloudfront.net/6657ba50e702d84afb32fe846bed54fba1a77add/827ae/logo.svg","descr":"快速、简单且强大的网站框架"},{"name":"anzhiyu主题","link":"https://blog.anheyu.com/","avatar":"https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg","descr":"生活明朗，万物可爱","siteshot":"https://npm.elemecdn.com/anzhiyu-theme-static@1.1.6/img/blog.anheyu.com.jpg"},{"name":"安知鱼","link":"https://blog.anheyu.com/","avatar":"https://npm.elemecdn.com/anzhiyu-blog-static@1.0.4/img/avatar.jpg","descr":"生活明朗，万物可爱","siteshot":"https://npm.elemecdn.com/anzhiyu-theme-static@1.1.6/img/blog.anheyu.com.jpg","color":"vip","tag":"荐"},{"name":"清羽飞扬","link":"https://blog.liushen.fun/","avatar":"https://blog.liushen.fun/info/avatar.ico","descr":"柳影曳曳，清酒孤灯，扬笔撒墨，心境如霜","siteshot":"https://blog.liushen.fun/info/siteshot.jpg","recommend":true},{"name":"XingJiのBlog","link":"https://love.xingji.fun/","avatar":"https://i.p-i.vip/47/20240920-66ed7b168c38c.jpg","descr":"迄今所有人生都大写着失败，但不妨碍我继续向前✨","siteshot":"https://i.p-i.vip/47/20240920-66ed7b6730ca9.png"},{"name":"竹山一叶","link":"https://zsyyblog.com","avatar":"https://img.zsyyblog.com/favicon.jpg","descr":"来了就不想走的小家","siteshot":"https://img.zsyyblog.com/siteshot.png"},{"name":"❖星港◎Star☆","link":"https://blog.starsharbor.com","avatar":"https://7.isyangs.cn/85/67b33ac68d72d-85.webp","descr":"以博客记录生活与热爱！","siteshot":"https://7.isyangs.cn/85/67b4add13f820-85.webp"},{"name":"海拥","link":"https://haiyong.site","avatar":"https://haiyong.site/img/favicon.png","descr":"一枚乐于分享技术与快乐的博主","recommend":true},{"name":"一粒微尘","link":"https://blog.667408.xyz","avatar":"https://blog.667408.xyz/favicon.ico","descr":"撷光以望，纳星于瞳"},{"name":"Spark の Blog","link":"https://www.aspark.cc","avatar":"https://www.aspark.cc/img/avatar.webp","descr":"星星之火，可以燎原。"},{"name":"陆小启","link":"https://lxqxm.top","avatar":"https://bu.dusays.com/2024/08/28/66ceb35deb5b1.webp","descr":"一个对你有帮助的圈子"},{"name":"钧言极客","link":"https://www.jinjun.top/","avatar":"https://wwww.jinjun.top/img/avatar.jpg","descr":"记录生活,爱好学习,不爱折腾"},{"name":"梦爱吃鱼","link":"https://blog.bsgun.cn/","avatar":"https://oss-cdn.bsgun.cn/logo/avatar.256.png","descr":"但愿日子清静抬头遇见的满是柔情"},{"name":"弈鸣小筑","link":"https://blog.lwtools.site","avatar":"https://images.lwtools.online/i/2024/07/23/807114.webp","descr":"功不唐捐，玉汝于成"},{"name":"JessicaGracewell","link":"https://jessicagracewell.top","avatar":"https://jessicagracewell.top/img/79774060.jpg","descr":"JessicaGracewell🌸"},{"name":"冰梦","link":"https://icemyst.github.io","avatar":"https://icemyst.github.io/img/about.webp","descr":"到不了的都叫远方，回不去的都叫故乡。"},{"name":"胜天半子","link":"https://blog.291055.xyz/","avatar":"https://i1.wp.com/ruom.wuaze.com/i/2024/11/02/166823.webp","descr":"事已至此，先吃饭吧😋"},{"name":"小嘉的部落格","link":"https://blog.imzjw.cn","avatar":"https://npm.elemecdn.com/nanshen/avatar.jpg","descr":"一个爱折腾的Java开发工程师"},{"name":"Elykia","link":"https://blog.elykia.cn/","avatar":"https://bu.dusays.com/2024/10/25/671b2438203a6.gif","descr":"致以无暇之人"}];
    var refreshNum = 1;
    function friendChainRandomTransmission() {
      const randomIndex = Math.floor(Math.random() * friend_link_list.length);
      const { name, link } = friend_link_list.splice(randomIndex, 1)[0];
      Snackbar.show({
        text:
          "点击前往按钮进入随机一个友链，不保证跳转网站的安全性和可用性。本次随机到的是本站友链：「" + name + "」",
        duration: 8000,
        pos: "top-center",
        actionText: "前往",
        onActionClick: function (element) {
          element.style.opacity = 0;
          window.open(link, "_blank");
        },
      });
    }
    function addFriendLinksInFooter() {
      var footerRandomFriendsBtn = document.getElementById("footer-random-friends-btn");
      if(!footerRandomFriendsBtn) return;
      footerRandomFriendsBtn.style.opacity = "0.2";
      footerRandomFriendsBtn.style.transitionDuration = "0.3s";
      footerRandomFriendsBtn.style.transform = "rotate(" + 360 * refreshNum++ + "deg)";
      const finalLinkList = [];
  
      let count = 0;

      while (friend_link_list.length && count < 3) {
        const randomIndex = Math.floor(Math.random() * friend_link_list.length);
        const { name, link, avatar } = friend_link_list.splice(randomIndex, 1)[0];
  
        finalLinkList.push({
          name,
          link,
          avatar,
        });
        count++;
      }
  
      let html = finalLinkList
        .map(({ name, link }) => {
          const returnInfo = "<a class='footer-item' href='" + link + "' target='_blank' rel='noopener nofollow'>" + name + "</a>"
          return returnInfo;
        })
        .join("");
  
      html += "<a class='footer-item' href='/link/'>更多</a>";

      document.getElementById("friend-links-in-footer").innerHTML = html;

      setTimeout(()=>{
        footerRandomFriendsBtn.style.opacity = "1";
      }, 300)
    };