package com.chasmet.quizanglais;
import org.junit.Test;
import static org.junit.Assert.*;
public class UpdatePolicyTest {
    @Test public void acceptsOnlyOfficialVersionedAsset() {
        String url = "https://github.com/Chasmet/Application-anglais-/releases/download/v4.0.0/Anglais-Plus-v4.0.0.apk";
        assertTrue(UpdatePolicy.officialAsset(url, "4.0.0"));
        assertFalse(UpdatePolicy.officialAsset(url.replace("Chasmet", "other"), "4.0.0"));
        assertFalse(UpdatePolicy.officialAsset(url + "?redirect=other", "4.0.0"));
        assertFalse(UpdatePolicy.officialAsset(url, "../4.0.0"));
        assertFalse(UpdatePolicy.officialAsset(url, "4.0.1"));
    }
    @Test public void comparesNumericVersionsAndRejectsMalformedMetadata() {
        assertTrue(UpdatePolicy.compareVersions("4.10.0", "4.9.2") > 0);
        assertTrue(UpdatePolicy.compareVersions("4.0.0", "4.0.1") < 0);
        assertEquals(0, UpdatePolicy.compareVersions("4.0.0", "4.0.0"));
        assertFalse(UpdatePolicy.validVersion("4.0.0-preview"));
        assertFalse(UpdatePolicy.validVersion("999999999999999.0.0"));
    }
}
