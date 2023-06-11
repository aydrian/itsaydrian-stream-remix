export type ResolvedRemixLoader<T extends (...args: any) => any> = Awaited<
  ReturnType<Awaited<ReturnType<T>>["json"]>
>;

export type EventTypes =
  | "channel.channel_points_custom_reward_redemption.add"
  | "channel.follow"
  | "channel.raid"
  | "channel.subscribe"
  | "stream.offline"
  | "stream.online";

export interface EventSubEvent {}

export interface ChannelEvent extends EventSubEvent {
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

export interface RaidEvent extends EventSubEvent {
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

export interface StreamOnlineEvent extends EventSubEvent {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  id: string;
  started_at: string;
  type: "live" | "playlist" | "premiere" | "rerun" | "watch_party";
}

export interface StreamOfflineEvent extends EventSubEvent {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
}
