#include <bits/stdc++.h>
#include <sys/resource.h> // Add this header
using namespace std;

/*
TESTING LINES OF RELVANT CODE
*/

int main() {
    std::cout << "Hello, World!" << std::endl;

    int a = 5;
    int b = 10;
    std::cout << "Sum: " << (a + b) << std::endl;

    // Add this block to check memory
    struct rusage usage;
    getrusage(RUSAGE_SELF, &usage);
    std::cout << "Memory usage: " << usage.ru_maxrss << " KB" << std::endl;

    // * Test complete */
    return 0;
}