#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    long long n;
    if (!(cin >> n)) {
        cerr << "no input" << '\n';
        return 1;
    }

    long long sum = 0;
    for (long long i = 0; i < n; ++i) {
        sum += i;
    }

    cout << "sum(" << n << ")=" << sum << '\n';
    return 0;
}
