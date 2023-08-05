class SurveyFinished(Exception):
    """Event triggers when answers are fullfilled."""


class QuestionAnswered(Exception):
    """
    Event triggers when answer is for
    question that already has one.
    """