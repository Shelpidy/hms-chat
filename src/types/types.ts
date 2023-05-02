export type RUser = {
  _id: any;
  name: string;
  avatar: string;
};

export type ChatReturnType = {
  _id: number;
  text: string;
  image: string;
  audio: string;
  video: string;
  sent: boolean;
  received: boolean;
  pending: boolean;
  createdAt: Date;
  user: RUser;
};
