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
| A3   | Stress       | 5     |       |       |     |        |        |
| A4   | Spike        | 5     |       |       |     |        |        |
| A5   | Soak         | 2     |       |       |     |        |        |

## Part B
1.
2.
3.
4.
5.
6.
7.
8.
9.