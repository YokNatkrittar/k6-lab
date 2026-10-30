# K6 lab results

## Part 0
- Step 0.1, http_req_duration: 391.38 ms (1 request, so avg = min = max = p(95))
- Step 0.2, requests, rate and p(95), and why the rate stays below 5:- Step 0.2, requests, rate and p(95), and why the rate stays below 5: 74 requests, 3.59 req/s, p(95) = 379.56 ms. Each VU sends one request, waits for the answer (~0.32 s avg), then sleeps 1 s, so one iteration takes ~1.39 s. One VU therefore makes about 1/1.39 ≈ 0.72 req/s, and 5 VUs make about 3.6 req/s, below 5.
- Step 0.6, exit code of the normal run and of the run with P95=300: Normal run (p(95) < 1500 ms) passed all thresholds, exit code 0. With P95=300 the p(95) rule failed (measured p(95) = 393.38 ms > 300 ms), the other two rules passed, and K6 exited with code 99. A CI pipeline would read the 99 and fail the build.
- Step 0.7, rules that passed, p(95), p(99), exit code after your change: My first run with the requirement failed the p(95) rule (p(95) = 1.32 s > 1 s, p(99) = 1.38 s, 0% failed, exit code 99). The median was only 382 ms, so a few slow requests from the shared public site pushed p(95) up. A second run passed all three rules: p(95) = 430.73 ms, p(99) = 478.68 ms, failure rate = 0.00%, exit code 0. I then changed the p(95) limit from 1000 ms to 200 ms: the p(95) rule failed (p(95) = 466.36 ms), p(99) = 781.35 ms and the failure rate (0.00%) still passed, and the exit code was 99.
- Step 0.8, what was wrong, and how the checks showed it: The request sent 'pepperoni' and 'knife' in lowercase, but QuickPizza names them 'Pepperoni' and 'Knife' (seen with explore.js). The API matches names exactly, so it silently ignored both exclusions and still answered 200. Under load (5 VUs, 20 s, 74 requests), the "no pepperoni" check failed 5 times (93% passed) and "no knife needed" failed 30 times (59% passed). After fixing the capitalization, all checks passed. One manual request could easily have missed the bug, because the recommendation is random: pepperoni appeared in only about 7% of pizzas, so a single request would usually look correct. Many requests under load reveal a pattern that one sample hides.

## Part A results
| Step | Test type    | Users | Req/s | p(95) | Max | Failed | Checks |
| ---- | ------------ | ----- | ----- | ----- | --- | ------ | ------ |
| A1   | Smoke        | 1     | 0.49  | 407.34 ms | 412.59 ms | 0.00% | 100.00% |
| A2   | Average load | 3     | 1.33  | 406.96 ms | 478.16 ms | 0.00% | 100.00% |
| A3   | Stress       | 5     | 2.16  | 407.64 ms | 934.97 ms | 0.00% | 100.00% |
| A4   | Spike        | 5     | 1.00  | 403.26 ms | 1043.90 ms | 0.00% | 100.00% |
| A5   | Soak         | 2     | 0.93  | 712.82 ms | 2215.40 ms | 0.00% | 100.00% |

## Part B
1. See the results A1-A5 on the table above.

2. Each virtual user sends one request, waits for the answer (about 0.32 s on average), then sleeps 1 s, so one iteration takes about 1.39 s. One VU can therefore make only about 1 / 1.39 ≈ 0.72 requests per second, and 5 VUs make about 3.6 req/s (measured 3.59 req/s). The rate could only reach 5 req/s if the response time and the think time were both zero.

3. No. The load went up from 1.33 req/s (3 users) to 2.16 req/s (5 users), about 1.6 times more, but p(95) stayed the same: 406.96 ms in the average-load test and 407.64 ms in the stress test. This means both tests were far inside QuickPizza's operational envelope; the system has plenty of spare capacity at this load, so adding users did not slow it down. To see the response time grow, we would need many more users, which we must not do on a shared public site.

4. When the load jumped from 1 to 5 users at about 30 s, the response time rose a little: in that 10-second window the average went from about 280–345 ms to 352 ms, p(95) to 480 ms, and one request took 1,044 ms (probably a new user opening its first TLS connection). It returned to its earlier level within about 10–20 seconds (average 319 ms, p(95) 379 ms at 50–60 s), even before the load dropped back to 1 user.

5. No. The average response time was about 420 ms in both the first two minutes and the last two minutes of the 10-minute hold, and the error rate stayed at 0% for the whole run. There were short slow periods (up to 2.2 s) spread randomly across the run, but they did not grow over time, so they look like network or shared-server noise rather than degradation. A soak test of several hours could reveal a memory leak, where the server slowly uses more memory until it slows down or crashes. Other examples are connections or file handles that are never released, or logs and caches that grow until the disk fills.

6. The average hides the slowest users. In the soak test, the average was 403 ms but p(95) was 713 ms and the slowest request took 2.2 s, so a few slow requests can be lost inside a good-looking average. p(95) tells us what 95% of users actually experienced, which is closer to what a requirement promises. In Step 0.7, the median was only 382 ms while p(95) was 1.32 s, and only the p(95) threshold caught the problem.

7. (1) Network: our requests travel over the public internet from Thailand to QuickPizza's servers, so the numbers include network delay and its random variation. In a lab, the load generator sits next to the system on a fast local network. (2) Shared load: QuickPizza is used by people all over the world at the same time, so other users' traffic affects our results. I saw this in Step 0.7, where the same test failed once (p(95) 1.32 s) and passed a few minutes later (p(95) 431 ms). In a lab, we would be the only users and could control the hardware and configuration.

8. A stress, spike or breakpoint test with hundreds of users is effectively a denial-of-service attack. It can slow down or crash the site for its real users, it costs the owner money, and running it without permission can break the site's terms of use and the law (for example, Thailand's Computer Crime Act). We should only load test systems we own or have written permission to test.

9. Vague requirement: "The LINE app should send messages quickly."
   Testable requirement: "With 5 users sending messages at the same time for 1 minute, 95% of send-message requests complete within 500 ms, 99% within 1 s, and fewer than 0.5% fail."
   K6 thresholds:
   ```javascript
   export const options = {
     vus: 5,
     duration: '1m',
     thresholds: {
       http_req_duration: ['p(95)<500', 'p(99)<1000'],
       http_req_failed: ['rate<0.005'],
     },
   };
   ```