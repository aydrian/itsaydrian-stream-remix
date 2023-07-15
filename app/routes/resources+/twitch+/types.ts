export type EventType =
  | "channel.channel_points_custom_reward_redemption.add"
  | "channel.follow"
  | "channel.raid"
  | "channel.subscribe"
  | "stream.offline"
  | "stream.online";

export type Subscription<T extends Condition> = {
  condition: T;
  cost: number;
  created_at: string;
  id: string;
  status: string;
  type: EventType;
  version: string;
};

export interface Condition {}

export interface ChannelCondition extends Condition {
  broadcaster_user_id: string;
}

export interface FollowCondition extends ChannelCondition {
  moderator_user_id: string;
}

export interface SubscribeCondition extends ChannelCondition {}

export interface RaidCondition extends Condition {
  from_broadcaster_user_id?: string;
  to_broadcaster_user_id?: string;
}

export interface CPRedeem extends ChannelCondition {
  reward_id?: string;
}

export interface StreamConditon extends Condition {
  broadcaster_user_id: string;
}

export type NotificationPayload<T extends Condition, K extends Event> = {
  event: K;
  subscription: Subscription<T>;
};

export interface Event {}

export interface ChannelEvent extends Event {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  user_id: string;
  user_login: string;
  user_name: string;
}

export interface FollowEvent extends ChannelEvent {
  followed_at: string;
}

export interface SubscribeEvent extends ChannelEvent {
  is_gift: boolean;
  tier: string;
}

export interface RaidEvent extends Event {
  from_broadcaster_user_id: string;
  from_broadcaster_user_login: string;
  from_broadcaster_user_name: string;
  to_broadcaster_user_id: string;
  to_broadcaster_user_login: string;
  to_broadcaster_user_name: string;
  viewers: string;
}

export interface CPRedeemEvent extends ChannelEvent {
  id: string;
  redeemed_at: string;
  reward: {
    cost: number;
    id: string;
    prompt: string;
    title: string;
  };
  status: "canceled" | "fulfilled" | "unfulfilled" | "unknown";
  user_input: string;
}

export interface StreamEvent extends Event {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
}

export interface OnlineEvent extends StreamEvent {
  id: string;
  started_at: string;
  type: "live" | "playlist" | "premiere" | "rerun" | "watch_party";
}

export interface OfflineEvent extends StreamEvent {}
