package com.chasmet.quizanglais;

final class UpdatePolicy {
    private UpdatePolicy() {}
    static boolean validVersion(String version) {
        return version != null && version.matches("[0-9]{1,6}\\.[0-9]{1,6}\\.[0-9]{1,6}");
    }
    static boolean officialAsset(String url, String version) {
        return validVersion(version) && ("https://github.com/Chasmet/Application-anglais-/releases/download/v"
                + version + "/Anglais-Plus-v" + version + ".apk").equals(url);
    }
    static int compareVersions(String a, String b) {
        if (!validVersion(a) || !validVersion(b)) return 0;
        String[] aa = a.split("\\."), bb = b.split("\\.");
        for (int i = 0; i < 3; i++) {
            int difference = Integer.compare(Integer.parseInt(aa[i]), Integer.parseInt(bb[i]));
            if (difference != 0) return difference;
        }
        return 0;
    }
}
