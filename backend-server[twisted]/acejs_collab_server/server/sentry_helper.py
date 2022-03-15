import logging

import sentry_sdk

sentry_state = {"initialized":False}
def init_sentry():
    if sentry_state["initialized"]:
        print("Already Initialized...")
        return
    sentry_sdk.init(
        "https://1f5d563fd02c4ce88b84aadf6c19824d@o1165515.ingest.sentry.io/6255641",
        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        # We recommend adjusting this value in production.
        traces_sample_rate=1.0
    )
    sentry_state["initialized"] = True
class SentryLoggerHandler(logging.Handler):
    def emit(self, record):
        try:
            print("REC:",dir(record))
            print("LEVEL:",record.levelname)
            print("NAME:",record.name)
            msg = self.format(record)
            print("MSG:",msg)
        except (KeyboardInterrupt, SystemExit):
            raise
        except:
            self.handleError(record)
sentry_log = logging.getLogger("sentry-logger")
sentry_log.setLevel(logging.DEBUG)
sentry_log.addHandler(SentryLoggerHandler())

sentry_log.info("Hello World?",extra={''})
def sentry_transact(op,name=None):
    def __inner1(fn):
        real_name = name or fn.__name__
        def __inner2(*args,**kwargs):
            with sentry_sdk.start_transaction(op=op,name=real_name):
                return fn(*args,**kwargs)
        return __inner2
    return __inner1


