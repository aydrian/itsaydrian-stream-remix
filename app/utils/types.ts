export type ResolvedRemixLoader<T extends (...args: any) => any> = Awaited<
  ReturnType<Awaited<ReturnType<T>>["json"]>
>;

export type EventTypes =
  | "stream.offline"
  | "stream.online"
  | "channel.follow"
  | "channel.raid"
  | "channel.subscribe"
  | "channel.channel_points_custom_reward_redemption.add";

export interface EventSubEvent {}

export interface ChannelEvent extends EventSubEvent {
  user_id: string;
  user_login: string;
  user_name: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
}

export interface FollowEvent extends ChannelEvent {
  followed_at: string;
}

export interface SubscribeEvent extends ChannelEvent {
  tier: string;
  is_gift: boolean;
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
  user_input: string;
  status: "unknown" | "unfulfilled" | "fulfilled" | "canceled";
  reward: {
    id: string;
    title: string;
    cost: number;
    prompt: string;
  };
  redeemed_at: string;
}

export interface StreamOnlineEvent extends EventSubEvent {
  id: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
  type: "live" | "playlist" | "watch_party" | "premiere" | "rerun";
  started_at: string;
}

export interface StreamOfflineEvent extends EventSubEvent {
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
}
