#
#
import bq
from bq.core.model import DeclarativeBase, metadata, DBSession


from tag_model import *
log = None
#from store import *
#from xmlstore import *
#from dbxmlstore import *

def init_model(engine):
    """Call me before using any of the tables or classes in the model."""

    DBSession.configure(bind=engine)
    # If you are using reflection to introspect your database and create
    # table objects for you, your tables must be defined and mapped inside
    # the init_model function, so that the engine is available if you
    # use the model outside tg2, you need to make sure this is called before
    # you use the model.



# Import your model modules here.
#from bq.data_service.model.data_service_module import *
