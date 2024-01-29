type ActionResultSuccess = {
    success: true;
};

type ActionResultFailure = {
    success: false;
    error: string;
};

export type ActionResult = ActionResultSuccess | ActionResultFailure;
