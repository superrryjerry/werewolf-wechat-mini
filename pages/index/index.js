// pages/index/index.js
const app = getApp();

Page({
  data: {
    roomId: '',
    rooms: [], // 可用房间列表
    isCreating: false,
  },

  onLoad() {
    this.loadRooms();
  },

  // 输入房间号
  onRoomIdInput(e) {
    this.setData({ roomId: e.detail.value });
  },

  // 创建房间
  createRoom() {
    if (this.data.isCreating) return;
    this.setData({ isCreating: true });
    
    // 生成4位房间号
    const roomId = this.generateRoomId();
    
    wx.showLoading({ title: '创建房间中...' });
    
    // 模拟创建房间（实际需要WebSocket）
    setTimeout(() => {
      wx.hideLoading();
      wx.navigateTo({
        url: `/pages/judge/judge?roomId=${roomId}&action=create&isJudge=true`,
      });
      this.setData({ isCreating: false });
    }, 1000);
  },

  // 加入房间
  joinRoom() {
    const roomId = this.data.roomId.trim();
    
    if (!roomId) {
      wx.showToast({
        title: '请输入房间号',
        icon: 'none',
      });
      return;
    }
    
    if (roomId.length !== 4) {
      wx.showToast({
        title: '房间号必须是4位',
        icon: 'none',
      });
      return;
    }
    
    wx.showLoading({ title: '加入房间...' });
    
    // 模拟加入房间
    setTimeout(() => {
      wx.hideLoading();
      wx.navigateTo({
        url: `/pages/room/room?roomId=${roomId}&action=join`,
      });
    }, 1000);
  },

  // 快速加入（随机房间）
  quickJoin() {
    const rooms = this.data.rooms;
    if (rooms.length === 0) {
      wx.showToast({
        title: '暂无可用房间',
        icon: 'none',
      });
      return;
    }
    
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)];
    this.setData({ roomId: randomRoom.roomId });
    this.joinRoom();
  },

  // 生成4位房间号
  generateRoomId() {
    const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let roomId = '';
    for (let i = 0; i < 4; i++) {
      roomId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return roomId;
  },

  // 加载可用房间
  loadRooms() {
    // 模拟房间数据
    this.setData({
      rooms: [
        { roomId: 'A1B2', playerCount: 6, status: 'waiting' },
        { roomId: 'C3D4', playerCount: 8, status: 'playing' },
      ],
    });
  },

  // 选择已有房间
  selectRoom(e) {
    const roomId = e.currentTarget.dataset.roomid;
    this.setData({ roomId });
    this.joinRoom();
  },
});