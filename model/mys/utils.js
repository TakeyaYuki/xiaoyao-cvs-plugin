import _ from 'lodash';
import moment from 'moment';
export async function sleepAsync(sleepms) {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve();
		}, sleepms)
	});
}


export async function randomSleepAsync(end) {
	let sleep = 4 * 1000 + _.random((end || 5) * 1000);
	await sleepAsync(sleep);
}
export function randomString(length, os = false) {
	let randomStr = '';
	for (let i = 0; i < length; i++) {
		randomStr += _.sample(os ? '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz' :
			'abcdefghijklmnopqrstuvwxyz0123456789');
	}
	return randomStr;
}
export async function redisDel(userId, type = 'bbs') {
	return await redis.del(`xiaoyao:${type}:${userId}`)
}
export async function redisGet(userId, type = 'bbs') {
	return JSON.parse(await redis.get(`xiaoyao:${type}:${userId}`))
}
export async function redisSet(userId="all", type = 'bbs', data, time=0) {
	var dayTime = moment(Date.now()).add('days', 1).format('YYYY-MM-DD 00:00:00')
	var new_date = (new Date(dayTime).getTime() - new Date().getTime()) / 1000 //获取隔天凌晨的时间差
	if (time!==0) {
		new_date = time
	}
	return await redis.set(`xiaoyao:${type}:${userId}`, JSON.stringify(data), {
		EX: parseInt(new_date)
	});
}

/**
 * 发送私聊消息，仅给好友发送
 * @param user_id qq号
 * @param msg 消息
 */
export async function relpyPrivate(userId, msg) {
	userId = Number(userId) || userId
	let friend = Bot.fl.get(userId)
	if (friend) {
		Bot.logger.mark(`发送好友消息[${friend.nickname}](${userId})`)
		return await Bot.pickUser(userId).sendMsg(msg).catch((err) => {
			Bot.logger.mark(err)
		})
	}
}
export async function replyMake(e, _msg, lenght) {
	const bot = e.bot || Bot
	let nickname = bot.nickname;
	if (e.isGroup && bot.getGroupMemberInfo) try {
		const info = await bot.getGroupMemberInfo(e.group_id, bot.uin)
		nickname = info.card || info.nickname
	} catch {}
	let msgList = [];
	for (let [index, item] of Object.entries(_msg)) {
		if (index < lenght) {
			continue;
		}
		msgList.push({
			message: item,
			nickname: nickname,
			user_id: bot.uin
		})
	}
	if (e.isGroup) {
		msgList = await e.group.makeForwardMsg(msgList)
	} else {
		msgList = await e.friend.makeForwardMsg(msgList)
	}
	if (e._reply) {
		e._reply(msgList);
	} else {
		e.reply(msgList);
	}
}

export function getServer(uid) {
	switch (String(uid)[0]) {
		case '1':
		case '2':
			return 'cn_gf01' // 官服
		case '5':
			return 'cn_qd01' // B服
		case '6':
			return 'os_usa' // 美服
		case '7':
			return 'os_euro' // 欧服
		case '8':
			return 'os_asia' // 亚服
		case '9':
			return 'os_cht' // 港澳台服
	}
	return 'cn_gf01'
}
export async function getCookieMap(cookie) {
	let cookieArray = cookie.replace(/\s*/g, "").split(";");
	let cookieMap = new Map();
	for (let item of cookieArray) {
		// 按首个=切分，v2 token 值自身可能带=
		let index = item.indexOf("=");
		if (index < 1) continue;
		cookieMap.set(item.slice(0, index), item.slice(index + 1));
	}
	return cookieMap || {};
}

/** 取通行证id，优先v2字段 */
export function getLtuid(map) {
	if (!map) return '';
	return map.get("ltuid_v2") || map.get("account_id_v2") || map.get("ltuid") || map.get("account_id") || map.get("stuid") || '';
}

/** 由v2 token组装ck，缺失关键字段返回空串 */
export function buildV2Cookie({ stuid, mid, ltoken, cookie_token } = {}) {
	if (!stuid || !ltoken || !cookie_token) return '';
	let ck = `ltuid_v2=${stuid};account_id_v2=${stuid};cookie_token_v2=${cookie_token};ltoken_v2=${ltoken};`;
	if (mid) ck += `ltmid_v2=${mid};account_mid_v2=${mid};`;
	return ck;
}
/**
 * 
 * @param {e} e 
 * @param {撤回的消息id} r 
 * @param {多久撤回(秒)} times 
 */
export function recallMsg(e,r,times){
	setTimeout(()=>{
		if(e?.group?.recallMsg&&r?.message_id){
			e?.group?.recallMsg(r?.message_id)
		}else if(e?.friend?.recallMsg&&r?.message_id){
			e?.friend?.recallMsg(r?.message_id)
		}
	},1000 * times)
}


export default {
	sleepAsync,redisDel,
	getServer,
	randomSleepAsync,
	replyMake,
	randomString,
	redisGet,
	redisSet,recallMsg,
	relpyPrivate,
	getCookieMap,
	getLtuid,
	buildV2Cookie
}