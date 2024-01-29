type ActionResultSuccess = {
    success: true;
    data?: any;
};

type ActionResultFailure = {
    success: false;
    error: string;
};

export type ActionResult = ActionResultSuccess | ActionResultFailure;
