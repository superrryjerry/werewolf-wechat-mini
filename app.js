// app.js - 狼人杀小程序入口
App({
  globalData: {
    userInfo: null,
    userId: '',
    roomId: '',
    isJudge: false, // 是否是法官
    ws: null, // WebSocket连接
    gameStatus: 'waiting', // waiting | day | night | voting | result
    players: [], // 房间内玩家列表
    myRole: null, // 我的身份
  },
  
  onLaunch() {
    // 生成用户ID
    this.globalData.userId = 'user_' + Date.now() + Math.random().toString(36).substr(2, 6);
  },
  
  // 初始化WebSocket
  initWebSocket() {
    const ws = wx.connectSocket({
      url: 'wss://werewolf-server.example.com/ws', // 替换为实际服务器地址
    });
    
    ws.onSocketOpen(() => {
      console.log('WebSocket连接成功');
    });
    
    ws.onSocketMessage((res) => {
      this.handleMessage(JSON.parse(res.data));
    });
    
    ws.onSocketClose(() => {
      console.log('WebSocket连接关闭');
    });
    
    this.globalData.ws = ws;
  },
  
  // 处理服务器消息
  handleMessage(data) {
    const eventType = data.type;
    const pages = getCurrentPages();
    const currentPage = pages[pages.length - 1];
    
    switch(eventType) {
      case 'room_info':
        this.globalData.players = data.players;
        this.globalData.roomId = data.roomId;
        if (currentPage) {
          currentPage.setData({ players: data.players });
        }
        break;
        
      case 'role_assigned':
        this.globalData.myRole = data.role;
        if (currentPage) {
          currentPage.setData({ myRole: data.role });
        }
        break;
        
      case 'game_start':
        this.globalData.gameStatus = 'night';
        wx.navigateTo({ url: '/pages/room/room' });
        break;
        
      case 'phase_change':
        this.globalData.gameStatus = data.phase;
        if (currentPage) {
          currentPage.setData({ gamePhase: data.phase });
        }
        break;
        
      case 'vote_start':
        wx.showModal({
          title: '投票环节',
          content: '请选择要票出的玩家',
          showCancel: false,
        });
        break;
        
      case 'player_dead':
        wx.showToast({
          title: `${data.playerId} 被票出`,
          icon: 'none',
        });
        break;
        
      case 'game_result':
        wx.navigateTo({
          url: `/pages/judge/judge?winner=${data.winner}`,
        });
        break;
    }
  },
  
  // 发送消息到服务器
  sendMessage(data) {
    if (this.globalData.ws) {
      this.globalData.ws.send({ data: JSON.stringify(data) });
    }
  },
});