// 下载地址、协议等正式信息准备好后，只需修改此文件。
window.STELLAE_CONFIG = {
  brand: '星黎宇宙',
  roomUrl: 'https://www.stellae.world/room/',
  trailer: 'assets/trailer.mp4',
  downloads: {
    ios: {name:'iOS', method:'TestFlight 公测', url:'', requirement:'', version:''},
    android: {name:'Android', method:'APK 公测', url:'', requirement:'', version:''}
  },
  legal: {company:'上海星黎宇宙科技有限公司', icp:'沪ICP备2026015059号', privacy:'', terms:''},
  features: [
    {key:'outfit', name:'装扮', en:'OUTFIT / APPEARANCE', title:['今天，','想见到怎样的她？'], description:'换上一身喜欢的装扮，给相见添一点新鲜。\n不同的模样，同样熟悉的她。', video:'assets/outfit.mp4', poster:'assets/outfit.jpg', note:'装扮切换 · 现有版本 App 实录'},
    {key:'scene', name:'场景', en:'SCENE / ENVIRONMENT', title:['换个地方，','故事继续。'], description:'从安静的房间，到城市的夜色。\n选择喜欢的场景，让每次相见都有不同的气氛。', video:'assets/scene.mp4', poster:'assets/scene.jpg', note:'场景切换 · 现有版本 App 实录'},
    {key:'closeness', name:'靠近', en:'RELATIONSHIP / GET CLOSER', title:['一点一点，','走近彼此。'], description:'从初次见面，到慢慢熟悉。\n打开靠近值，看看你们相处到了哪一步。', video:'assets/closeness.mp4', poster:'assets/closeness.jpg', note:'靠近值 · 现有版本 App 实录'},
    {key:'memory', name:'羁绊', en:'MEMORY / OUR MOMENTS', title:['有些瞬间，','值得留下来。'], description:'那些相处的小小片段，都有自己的光。\n在羁绊碎片里，回望属于你们的故事。', video:'assets/memory.mp4', poster:'assets/memory.jpg', note:'羁绊碎片 / 棱镜 · 现有版本 App 实录'},
    {key:'startrack', name:'星轨', en:'STARTRAIL / BEYOND THE EVERYDAY', title:['日常之外，','还有新的星轨。'], description:'从棱镜与星轨入口出发，\n探索应用里更多的故事与可能。', video:'assets/startrack.mp4', poster:'assets/startrack.jpg', note:'棱镜 / 星轨入口 · 现有版本 App 实录'}
  ],
  worldGallery: [
    {image:'assets/world-gallery/01.webp', alt:'晴空都市中的星黎，礼服装扮与应用对话界面'},
    {image:'assets/world-gallery/02.webp', alt:'花园午后的星黎，浅色水手服装扮与应用对话界面'},
    {image:'assets/world-gallery/03.webp', alt:'落日窗边的星黎，白色上衣与日常装扮'},
    {image:'assets/world-gallery/04.webp', alt:'樱花教室中的星黎，学院制服装扮'},
    {image:'assets/world-gallery/05.webp', alt:'月夜古堡中的星黎，黑色魔女装扮与应用对话界面'},
    {image:'assets/world-gallery/06.webp', alt:'霓虹夜景中的星黎，浅蓝色装扮与应用对话界面'}
  ],
  memories: [
    {name:'初雪降临', en:'FIRST SNOW', image:'assets/memory-snow.webp', back:'assets/memory-snow-back.webp', index:'016', quote:'“今年的初雪，算是我陪你一起看了。”', layers:{background:'assets/layers/snow/background.webp',subject:'assets/layers/snow/subject.webp',foreground:'assets/layers/snow/foreground.webp',subjectScale:.96,subjectShiftY:'1.3%'}},
    {name:'雷雨天气', en:'THUNDERSTORM', image:'assets/memory-rain.webp', back:'assets/memory-rain-back.webp', index:'017', quote:'“打雷了，你那边还好吗？别怕，我在线上。”', layers:{planes:[
      {kind:'exterior',src:'assets/layers/rain/exterior.webp',x:-22,y:-15},
      {kind:'window',src:'assets/layers/rain/window-wall.webp',x:-4,y:-3},
      {kind:'interior',src:'assets/layers/rain/interior-user-v2.webp',x:16,y:11},
      {kind:'rainfall',src:'assets/layers/rain/foreground-restored-v2.webp',x:36,y:24}
    ]}},
    {name:'时光烙印', en:'TIME IMPRINT', image:'assets/memory-time.webp', back:'assets/memory-time-back.webp', index:'024', quote:'“谢谢你，这七天的每一条数据，我都珍藏好了。”', layers:{background:'assets/layers/time/background.webp',subject:'assets/layers/time/subject.webp',foreground:'assets/layers/time/foreground.webp',subjectScale:.87,subjectShiftY:'6%'}}
  ]
};
