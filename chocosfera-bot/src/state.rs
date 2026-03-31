use std::sync::Arc;

use crate::config::Config;
use crate::mongo::MongoStore;

#[derive(Clone)]
pub struct AppState {
    pub mongo: MongoStore,
    pub config: Arc<Config>,
}
