// pages/room/room.js - 游戏房间页面
const app = getApp();

Page({
  data: {
    roomId: '',
    players: [],
    myRole: null,
    myUserId: '',
    isJudge: false,
    gamePhase: 'waiting', // waiting | day | night | voting
    canSpeak: false,
    selectedPlayer: null,
    votes: [],
  },

  onLoad(options) {
    this.setData({
      roomId: options.roomId,
      myUserId: app.globalData.userId,
      isJudge: options.isJudge === 'true',
    });
    
    // 加载玩家列表
    this.loadPlayers();
  },

  // 加载玩家列表
  loadPlayers() {
    // 模拟玩家数据
    const mockPlayers = [
      { userId: 'user1', name: '玩家1', alive: true, role: null },
      { userId: 'user2', name: '玩家2', alive: true, role: null },
      { userId: 'user3', name: '玩家3', alive: true, role: null },
      { userId: 'user4', name: '玩家4', alive: true, role: null },
      { userId: 'user5', name: '玩家5', alive: true, role: null },
      { userId: 'user6', name: '玩家6', alive: true, role: null },
    ];
    
    this.setData({ players: mockPlayers });
  },

  // 选择玩家（投票/杀人）
  selectPlayer(e) {
    const userId = e.currentTarget.dataset.userid;
    this.setData({ selectedPlayer: userId });
  },

  // 确认投票
  confirmVote() {
    if (!this.data.selectedPlayer) {
      wx.showToast({ title: '请选择玩家', icon: 'none' });
      return;
    }
    
    wx.showModal({
      title: '确认投票',
      content: `确定要票出 ${this.data.selectedPlayer} 吗？`,
      success: (res) => {
        if (res.confirm) {
          this.submitVote();
        }
      },
    });
  },

  // 提交投票
  submitVote() {
    wx.showToast({ title: '投票成功', icon: 'success' });
    this.setData({ selectedPlayer: null });
  },

  // 申请发言
  requestSpeak() {
    this.setData({ canSpeak: true });
    wx.showToast({ title: '轮到你发言了', icon: 'success' });
  },

  // 结束发言
  endSpeak() {
    this.setData({ canSpeak: false });
  },

  // 查看自己身份
  showMyRole() {
    if (!this.data.myRole) {
      wx.showToast({ title: '游戏还未开始', icon: 'none' });
      return;
    }
    
    const roleNames = {
      'werewolf': '狼人',
      'villager': '村民',
      'prophet': '预言家',
      'witch': '女巫',
      'hunter': '猎人',
      'idiot': '白癡',
    };
    
    wx.showModal({
      title: '你的身份',
      content: roleNames[this.data.myRole] || this.data.myRole,
      showCancel: false,
    });
  },

  // 切换到法官视角
  goToJudge() {
    wx.navigateTo({
      url: `/pages/judge/judge?roomId=${this.data.roomId}`,
    });
  },
});