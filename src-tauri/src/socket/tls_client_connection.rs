use std::sync::Arc;

use rcgen::{CertificateParams, DistinguishedName};
use rustls::{
    client::ServerCertVerifier, ClientConfig, ClientConnection, PrivateKey, RootCertStore,
};
use time::{Duration, OffsetDateTime};

pub fn get() -> Result<ClientConnection, rustls::Error> {
    ClientConnection::new(config(), name())
}

fn config() -> Arc<ClientConfig> {
    let (cert, key) = get_certificate_and_private_key();
    let mut config = ClientConfig::builder()
        .with_safe_defaults()
        .with_root_certificates(RootCertStore::empty())
        .with_client_auth_cert(vec![cert], key)
        .unwrap();

    let verifier = Arc::new(NoCertificateVerification);

    config.dangerous().set_certificate_verifier(verifier);

    Arc::new(config)
}

fn get_certificate_and_private_key() -> (rustls::Certificate, PrivateKey) {
    let (not_before, not_after) = valid_time();

    let mut cp = CertificateParams::new(vec![]);
    cp.not_before = not_before;
    cp.not_after = not_after;
    cp.distinguished_name = distinguished_name();
    cp.is_ca = rcgen::IsCa::ExplicitNoCa;

    let rcgen_cert = rcgen::Certificate::from_params(cp).unwrap();

    let rustls_cert = rustls::Certificate(rcgen_cert.serialize_der().unwrap());

    (
        rustls_cert,
        PrivateKey(rcgen_cert.serialize_private_key_der()),
    )
}

fn valid_time() -> (OffsetDateTime, OffsetDateTime) {
    let now_local = OffsetDateTime::now_utc();

    let before = now_local - Duration::DAY;
    let after = now_local + Duration::WEEK;

    (before, after)
}

fn distinguished_name() -> DistinguishedName {
    let mut dn = DistinguishedName::new();
    dn.push(rcgen::DnType::CommonName, "CommonName");
    return dn;
}

fn name() -> rustls::ServerName {
    //It's not important because we are not authenticating the server
    "hostname".try_into().unwrap()
}

struct NoCertificateVerification;

impl ServerCertVerifier for NoCertificateVerification {
    fn verify_server_cert(
        &self,
        _end_entity: &rustls::Certificate,
        _intermediates: &[rustls::Certificate],
        _server_name: &rustls::ServerName,
        _scts: &mut dyn Iterator<Item = &[u8]>,
        _ocsp_response: &[u8],
        _now: std::time::SystemTime,
    ) -> Result<rustls::client::ServerCertVerified, rustls::Error> {
        Ok(rustls::client::ServerCertVerified::assertion())
    }
}
