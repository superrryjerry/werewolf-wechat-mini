// pages/judge/judge.js - 法官控制面板
const app = getApp();

Page({
  data: {
    roomId: '',
    players: [],
    gamePhase: 'waiting', // waiting -> night1 -> day1 -> night2 -> day2 -> ...
    dayNumber: 1,
    phaseProgress: 0, // 0:准备 1:天黑 2:睁眼 3:发言 4:投票 5:结算
    roles: [], // 所有角色分配
    savedRoles: [], // 已分配的角色
    werewolfTargets: [], // 狼人选择的目标
    prophetCheck: null, // 预言家查验结果
    witchPoison: true, // 女巫是否有毒药
    witchAntidote: true, // 女巫是否有解药
    hunterShoot: null, // 猎人是否能发动
    logMessages: [], // 游戏记录
    winner: null, // 获胜方
  },

  onLoad(options) {
    if (options.roomId) {
      this.setData({ roomId: options.roomId });
    }
    
    // 初始化角色池
    this.initRoles();
    // 初始化玩家
    this.initPlayers();
  },

  // 初始化角色池（标准12人局）
  initRoles() {
    const allRoles = [
      { id: 'werewolf', name: '狼人', team: 'werewolf', count: 4 },
      { id: 'villager', name: '村民', team: 'villager', count: 4 },
      { id: 'prophet', name: '预言家', team: 'villager', count: 1 },
      { id: 'witch', name: '女巫', team: 'villager', count: 1 },
      { id: 'hunter', name: '猎人', team: 'villager', count: 1 },
      { id: 'idiot', name: '白癡', team: 'villager', count: 1 },
    ];
    
    this.setData({ roles: allRoles, savedRoles: [] });
  },

  // 初始化玩家
  initPlayers() {
    const mockPlayers = [
      { userId: 'p1', name: '1号', alive: true, role: null },
      { userId: 'p2', name: '2号', alive: true, role: null },
      { userId: 'p3', name: '3号', alive: true, role: null },
      { userId: 'p4', name: '4号', alive: true, role: null },
      { userId: 'p5', name: '5号', alive: true, role: null },
      { userId: 'p6', name: '6号', alive: true, role: null },
      { userId: 'p7', name: '7号', alive: true, role: null },
      { userId: 'p8', name: '8号', alive: true, role: null },
      { userId: 'p9', name: '9号', alive: true, role: null },
      { userId: 'p10', name: '10号', alive: true, role: null },
      { userId: 'p11', name: '11号', alive: true, role: null },
      { userId: 'p12', name: '12号', alive: true, role: null },
    ];
    
    this.setData({ players: mockPlayers });
  },

  // 分配角色
  distributeRoles() {
    const { players, roles } = this.data;
    let availableRoles = [];
    
    // 展开角色池
    roles.forEach(role => {
      for (let i = 0; i < role.count; i++) {
        availableRoles.push({ ...role });
      }
    });
    
    // 随机打乱
    availableRoles = availableRoles.sort(() => Math.random() - 0.5);
    
    // 分配给玩家
    const newPlayers = players.map((player, index) => ({
      ...player,
      role: availableRoles[index] ? availableRoles[index].id : null,
    }));
    
    this.setData({ 
      players: newPlayers,
      savedRoles: availableRoles,
    });
    
    this.addLog('角色已分配');
    wx.showToast({ title: '角色分配完成', icon: 'success' });
  },

  // 开始游戏
  startGame() {
    if (this.data.savedRoles.length === 0) {
      wx.showToast({ title: '请先分配角色', icon: 'none' });
      return;
    }
    
    this.setData({ 
      gamePhase: 'night1',
      dayNumber: 1,
      phaseProgress: 1,
    });
    
    this.addLog('游戏开始！第1天黑夜来临...');
    this.announcePhase('天黑请闭眼');
  },

  // 宣布阶段
  announcePhase(message) {
    wx.showModal({
      title: '法官指令',
      content: message,
      showCancel: false,
      success: () => {
        this.nextPhase();
      }
    });
  },

  // 进入下一阶段
  nextPhase() {
    const { gamePhase, phaseProgress, dayNumber } = this.data;
    let nextPhase = '';
    let nextProgress = phaseProgress + 1;
    
    if (phaseProgress === 1) {
      // 天黑 -> 狼人睁眼
      nextPhase = gamePhase;
      this.addLog('狼人请睁眼，请选择要杀的目标');
    } else if (phaseProgress === 2) {
      // 狼人 -> 预言家
      nextPhase = gamePhase;
      this.addLog('预言家请睁眼');
    } else if (phaseProgress === 3) {
      // 预言家 -> 女巫
      nextPhase = gamePhase;
      this.addLog('女巫请睁眼');
    } else if (phaseProgress === 4) {
      // 女巫 -> 天亮
      this.setData({ 
        gamePhase: `day${dayNumber}`,
        phaseProgress: 0,
      });
      this.addLog(`第${dayNumber}天白天来临`);
      this.announcePhase('天亮了！昨晚死了XXX号玩家');
    } else if (gamePhase.startsWith('day') && phaseProgress === 0) {
      // 白天 -> 发言 -> 投票 -> 夜间
      if (this.data.gamePhase === `day${dayNumber}`) {
        this.setData({ phaseProgress: 1 });
        this.addLog('请发言讨论');
        this.announcePhase('发言讨论环节');
      } else if (phaseProgress === 1) {
        this.setData({ 
          gamePhase: `night${dayNumber + 1}`,
          dayNumber: dayNumber + 1,
          phaseProgress: 1,
        });
        this.addLog(`第${dayNumber + 1}天黑夜来临...`);
        this.announcePhase('天黑请闭眼');
      }
    }
    
    if (nextPhase || nextProgress !== phaseProgress + 1) {
      this.setData({ phaseProgress: nextProgress });
    }
  },

  // 杀人（狼人操作）
  killPlayer(e) {
    const userId = e.currentTarget.dataset.userid;
    this.setData({ werewolfTargets: [userId] });
    this.addLog(`狼人选择杀害 ${userId}`);
  },

  // 查验（预言家操作）
  checkPlayer(e) {
    const userId = e.currentTarget.dataset.userid;
    const player = this.data.players.find(p => p.userId === userId);
    const isWerewolf = player.role === 'werewolf';
    
    this.setData({ 
      prophetCheck: { userId, isWerewolf },
      phaseProgress: 3,
    });
    
    wx.showModal({
      title: '查验结果',
      content: `${userId} 是${isWerewolf ? '狼人' : '好人'}`,
      showCancel: false,
    });
  },

  // 女巫技能
  useWitchSkill(e) {
    const skill = e.currentTarget.dataset.skill;
    const { witchPoison, witchAntidote } = this.data;
    
    if (skill === 'poison' && !witchPoison) {
      wx.showToast({ title: '毒药已用完', icon: 'none' });
      return;
    }
    
    if (skill === 'antidote' && !witchAntidote) {
      wx.showToast({ title: '解药已用完', icon: 'none' });
      return;
    }
    
    if (skill === 'poison') {
      this.setData({ witchPoison: false });
      this.addLog('女巫使用了毒药');
    } else if (skill === 'antidote') {
      this.setData({ witchAntidote: false });
      this.addLog('女巫使用了解药');
    }
  },

  // 猎人技能
  hunterSkill(e) {
    const userId = e.currentTarget.dataset.userid;
    this.setData({ hunterShoot: userId });
    this.addLog(`猎人帯走了 ${userId}`);
  },

  // 标记玩家死亡
  killPlayerByVote(userId) {
    const { players } = this.data;
    const newPlayers = players.map(p => 
      p.userId === userId ? { ...p, alive: false } : p
    );
    
    this.setData({ players: newPlayers });
    this.addLog(`${userId} 被票出`);
  },

  // 添加日志
  addLog(message) {
    const { logMessages } = this.data;
    const time = new Date().toLocaleTimeString();
    this.setData({ 
      logMessages: [`[${time}] ${message}`, ...logMessages].slice(0, 50) 
    });
  },

  // 检查胜利条件
  checkWinner() {
    const { players } = this.data;
    const alivePlayers = players.filter(p => p.alive);
    
    const werewolfsAlive = alivePlayers.filter(p => p.role === 'werewolf').length;
    const villagersAlive = alivePlayers.filter(p => p.role !== 'werewolf').length;
    
    if (werewolfsAlive === 0) {
      this.setData({ winner: '好人获胜' });
      this.addLog('游戏结束：好人获胜');
    } else if (werewolfsAlive >= villagersAlive) {
      this.setData({ winner: '狼人获胜' });
      this.addLog('游戏结束：狼人获胜');
    }
  },

  // 重新开始
  restartGame() {
    this.initRoles();
    this.initPlayers();
    this.setData({
      gamePhase: 'waiting',
      dayNumber: 1,
      phaseProgress: 0,
      logMessages: [],
      winner: null,
      werewolfTargets: [],
      prophetCheck: null,
      witchPoison: true,
      witchAntidote: true,
      hunterShoot: null,
    });
    this.addLog('游戏已重置');
  },
});